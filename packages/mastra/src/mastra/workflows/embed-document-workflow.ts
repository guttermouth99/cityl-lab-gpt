import { openai } from "@ai-sdk/openai";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { generateObject } from "ai";
import { z } from "zod";

import {
  type CityLabContent,
  type EmbedResult,
  type ExtractedDocumentMetadata,
  embedContent,
} from "../rag";
import { fetchUrlContent } from "../tools/jina-reader";

// ============================================================================
// Schemas
// ============================================================================

const CONTENT_PREVIEW_LENGTH = 500;

/**
 * Schema for AI-extracted metadata
 * Note: Using .nullable() instead of .optional() for OpenAI structured outputs
 * compatibility - strict mode requires all properties in 'required' array
 */
const metadataSchema = z.object({
  title: z.string().describe("The title of the document"),
  author: z
    .string()
    .nullable()
    .describe("The author name if found in the content, or null if not found"),
  tags: z
    .array(z.string())
    .describe("3-7 relevant keywords/tags for the content"),
  contentType: z
    .enum([
      "blog",
      "project",
      "youtube_transcript",
      "event",
      "page",
      "exhibition",
      "team",
      "newsletter",
    ])
    .describe("The type of content"),
  language: z
    .enum(["de", "en"])
    .describe("The primary language of the content"),
  publishedAt: z
    .string()
    .nullable()
    .describe(
      "Publication date in ISO 8601 format if found, or null if not found"
    ),
  sourceId: z
    .string()
    .describe(
      "A URL-safe slug generated from the title (lowercase, hyphens, no special chars)"
    ),
});

/**
 * Schema for extracted metadata (used for review step)
 */
const extractedMetadataSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  tags: z.array(z.string()),
  contentType: z.enum([
    "blog",
    "project",
    "youtube_transcript",
    "event",
    "page",
    "exhibition",
    "team",
    "newsletter",
  ]),
  language: z.enum(["de", "en"]),
  publishedAt: z.string().optional(),
  sourceId: z.string(),
});

/**
 * Schema for review step - suspend payload contains data for the reviewer
 */
const reviewSuspendPayloadSchema = z.object({
  content: z.string(),
  metadata: extractedMetadataSchema,
  url: z.string(),
  preview: z.string(),
});

/**
 * Schema for review step - resume data is the reviewer's decision
 */
const reviewResumeDataSchema = z.object({
  approved: z.boolean(),
  metadata: extractedMetadataSchema.optional(),
  rejectionReason: z.string().optional(),
});

/**
 * Schema for embed result
 */
const embedResultSchema = z.object({
  success: z.boolean(),
  status: z.enum(["embedded", "rejected"]),
  chunksCreated: z.number().optional(),
  sourceId: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => {
      const replacements: Record<string, string> = {
        ä: "ae",
        ö: "oe",
        ü: "ue",
        ß: "ss",
      };
      return replacements[char] ?? char;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ============================================================================
// Workflow Steps
// ============================================================================

/**
 * Step 1: Fetch content from URL using Jina Reader
 */
const fetchContentStep = createStep({
  id: "fetch-content",
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: z.object({
    content: z.string(),
    title: z.string(),
    url: z.string(),
  }),
  execute: async ({ inputData }) => {
    const result = await fetchUrlContent(inputData.url);
    return {
      content: result.content,
      title: result.title,
      url: result.url,
    };
  },
});

/**
 * Step 2: Extract metadata using AI
 */
const extractMetadataStep = createStep({
  id: "extract-metadata",
  inputSchema: z.object({
    content: z.string(),
    title: z.string(),
    url: z.string(),
  }),
  outputSchema: z.object({
    content: z.string(),
    metadata: extractedMetadataSchema,
    url: z.string(),
    preview: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { content, title: jinaTitle, url } = inputData;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: metadataSchema,
      prompt: `Analyze the following web content and extract metadata.

URL: ${url}
Title from page: ${jinaTitle}

Content:
${content.slice(0, 8000)}

Extract the metadata according to the schema. For the sourceId, generate a URL-safe slug based on the title.
If the content is primarily in German, set language to "de", otherwise "en".
For contentType, choose the most appropriate type based on the content structure and purpose.
Extract 3-7 relevant tags that describe the main topics.
Set author to null if no author name is found in the content.
Set publishedAt to null if no clear publication date is found in the content.`,
    });

    const extractedMetadata: ExtractedDocumentMetadata = {
      title: object.title,
      author: object.author ?? undefined, // Convert null to undefined
      tags: object.tags,
      contentType: object.contentType,
      language: object.language,
      publishedAt: object.publishedAt ?? undefined, // Convert null to undefined
      sourceId: object.sourceId || generateSlug(object.title),
    };

    return {
      content,
      metadata: extractedMetadata,
      url,
      preview: content.slice(0, CONTENT_PREVIEW_LENGTH),
    };
  },
});

/**
 * Step 3: Wait for human review (suspend step)
 *
 * This step suspends the workflow and provides the extracted data for review.
 * When resumed, it receives the reviewer's decision and passes it to the next step.
 */
const humanReviewStep = createStep({
  id: "human-review",
  inputSchema: z.object({
    content: z.string(),
    metadata: extractedMetadataSchema,
    url: z.string(),
    preview: z.string(),
  }),
  outputSchema: z.object({
    approved: z.boolean(),
    content: z.string(),
    metadata: extractedMetadataSchema,
    url: z.string(),
    rejectionReason: z.string().optional(),
  }),
  resumeSchema: reviewResumeDataSchema,
  suspendSchema: reviewSuspendPayloadSchema,
  execute: async ({ inputData, resumeData, suspend, bail }) => {
    // If we have resume data, the human has made a decision
    if (resumeData) {
      if (!resumeData.approved) {
        // Human rejected - bail out of the workflow
        return bail({
          approved: false,
          content: inputData.content,
          metadata: inputData.metadata,
          url: inputData.url,
          rejectionReason: resumeData.rejectionReason ?? "Document rejected",
        });
      }

      // Human approved - use edited metadata if provided
      return {
        approved: true,
        content: inputData.content,
        metadata: resumeData.metadata ?? inputData.metadata,
        url: inputData.url,
      };
    }

    // No resume data yet - suspend for human review
    return await suspend({
      content: inputData.content,
      metadata: inputData.metadata,
      url: inputData.url,
      preview: inputData.preview,
    });
  },
});

/**
 * Step 4: Embed content into vector database
 */
const embedContentStep = createStep({
  id: "embed-content",
  inputSchema: z.object({
    approved: z.boolean(),
    content: z.string(),
    metadata: extractedMetadataSchema,
    url: z.string(),
    rejectionReason: z.string().optional(),
  }),
  outputSchema: embedResultSchema,
  execute: async ({ inputData }) => {
    // If not approved (shouldn't happen due to bail, but safety check)
    if (!inputData.approved) {
      return {
        success: true,
        status: "rejected" as const,
        rejectionReason: inputData.rejectionReason,
      };
    }

    const contentToEmbed: CityLabContent = {
      id: inputData.metadata.sourceId,
      title: inputData.metadata.title,
      content: inputData.content,
      url: inputData.url,
      contentType: inputData.metadata.contentType,
      language: inputData.metadata.language,
      publishedAt: inputData.metadata.publishedAt,
      tags: inputData.metadata.tags,
      author: inputData.metadata.author,
    };

    const result: EmbedResult = await embedContent(contentToEmbed);

    if (!result.success) {
      throw new Error(result.error ?? "Failed to embed document");
    }

    return {
      success: true,
      status: "embedded" as const,
      chunksCreated: result.chunksCreated,
      sourceId: inputData.metadata.sourceId,
    };
  },
});

// ============================================================================
// Workflow
// ============================================================================

/**
 * Embed Document Workflow
 *
 * A single workflow that:
 * 1. Fetches content from a URL using Jina Reader
 * 2. Extracts metadata using AI
 * 3. Suspends for human review (HITL)
 * 4. Embeds approved content into the vector database
 */
export const embedDocumentWorkflow = createWorkflow({
  id: "embed-document",
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: embedResultSchema,
})
  .then(fetchContentStep)
  .then(extractMetadataStep)
  .then(humanReviewStep)
  .then(embedContentStep)
  .commit();
