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
  topic: z
    .enum([
      "smart-city",
      "innovative-administration",
      "open-cities",
      "kiezlabor",
      "open-data",
      "digital-collaboration",
      "events-networking",
    ])
    .nullable()
    .describe(
      "The main CityLAB Berlin topic area. Use: smart-city (Smart City, digitale Stadt), innovative-administration (innovative Verwaltung), open-cities (Open Cities), kiezlabor (Kiezlabor), open-data (Open Data, offene Daten), digital-collaboration (digitale Zusammenarbeit, Digital Collaboration), events-networking (Events, Networking, Veranstaltungen). Set to null if the topic cannot be clearly determined."
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
  topic: z
    .enum([
      "smart-city",
      "innovative-administration",
      "open-cities",
      "kiezlabor",
      "open-data",
      "digital-collaboration",
      "events-networking",
    ])
    .optional(),
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

/** Total characters to use for metadata extraction */
const METADATA_SAMPLE_LENGTH = 6000;

/** Content length threshold above which we use smart sampling */
const LONG_CONTENT_THRESHOLD = 10_000;

/**
 * Create a representative sample of content for metadata extraction.
 * For short content, returns the content as-is (up to METADATA_SAMPLE_LENGTH).
 * For long content (e.g., YouTube transcripts), extracts excerpts from
 * beginning, middle, and end to capture representative context.
 */
function createMetadataSample(content: string): string {
  if (content.length <= LONG_CONTENT_THRESHOLD) {
    return content.slice(0, METADATA_SAMPLE_LENGTH);
  }

  // For long content, take beginning + middle + end excerpts
  const excerptLength = Math.floor(METADATA_SAMPLE_LENGTH / 3);
  const middleStart = Math.floor((content.length - excerptLength) / 2);

  const beginning = content.slice(0, excerptLength);
  const middle = content.slice(middleStart, middleStart + excerptLength);
  const ending = content.slice(-excerptLength);

  return `[Beginning]\n${beginning}\n\n[Middle]\n${middle}\n\n[End]\n${ending}`;
}

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
 * Output schema for content retrieval (used for structured output)
 */
const contentOutputSchema = z.object({
  content: z.string(),
  title: z.string(),
  url: z.string(),
});

/**
 * Input schema for the workflow - accepts either URL or text
 */
const workflowInputSchema = z
  .object({
    /** URL to fetch content from */
    url: z.string().url().optional(),
    /** Direct text content (skips retrieval) */
    text: z.string().optional(),
    /** Title for text input */
    title: z.string().optional(),
    /** Source URL for text input (used for citation) */
    source: z.string().url().optional(),
  })
  .refine((data) => data.url || data.text, {
    message: "Either url or text must be provided",
  });

/**
 * Step 1: Retrieve content using Content Retrieval Agent
 *
 * The agent analyzes the URL and routes to the appropriate tool:
 * - YouTube URLs → youtubeTranscriberTool
 * - Other URLs → jinaReaderTool
 *
 * If text is provided directly, skips retrieval and returns the text.
 */
const retrieveContentStep = createStep({
  id: "retrieve-content",
  inputSchema: workflowInputSchema,
  outputSchema: contentOutputSchema,
  execute: async ({ inputData, mastra }) => {
    // If text is provided directly, skip retrieval
    if (inputData.text) {
      return {
        content: inputData.text,
        title: inputData.title ?? "Untitled Document",
        url: inputData.source ?? "text://user-provided",
      };
    }

    // URL mode: fetch content using the agent
    const agent = mastra?.getAgent("content-retrieval");
    if (!agent) {
      throw new Error("Content retrieval agent not found");
    }

    const response = await agent.generate(
      [
        {
          role: "user",
          content: `Fetch content from this URL: ${inputData.url}`,
        },
      ],
      {
        structuredOutput: {
          schema: contentOutputSchema,
        },
      }
    );

    return response.object;
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

    const contentSample = createMetadataSample(content);
    const isLongContent = content.length > LONG_CONTENT_THRESHOLD;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: metadataSchema,
      prompt: `Analyze the following web content and extract metadata.

URL: ${url}
Title from page: ${jinaTitle}
${isLongContent ? "\nNote: This is a long document. The content below shows excerpts from the beginning, middle, and end to help you understand the full context.\n" : ""}
Content:
${contentSample}

Extract the metadata according to the schema. For the sourceId, generate a URL-safe slug based on the title.
If the content is primarily in German, set language to "de", otherwise "en".
For contentType, choose the most appropriate type based on the content structure and purpose.
Extract 3-7 relevant tags that describe the main topics.
Set author to null if no author name is found in the content.
Set publishedAt to null if no clear publication date is found in the content.

For topic, classify the content into one of the CityLAB Berlin topic areas:
- "smart-city": Smart City, digitale Stadt, urban technology, connected city
- "innovative-administration": innovative Verwaltung, public sector innovation, government modernization
- "open-cities": Open Cities, open government, transparent city
- "kiezlabor": Kiezlabor, neighborhood lab, local community projects
- "open-data": Open Data, offene Daten, data portals, public datasets
- "digital-collaboration": digitale Zusammenarbeit, Digital Collaboration, co-creation, participatory processes
- "events-networking": Events, Networking, Veranstaltungen, conferences, meetups
Set topic to null if the content does not clearly fit any of these categories.`,
    });

    const extractedMetadata: ExtractedDocumentMetadata = {
      title: object.title,
      author: object.author ?? undefined, // Convert null to undefined
      tags: object.tags,
      contentType: object.contentType,
      language: object.language,
      publishedAt: object.publishedAt ?? undefined, // Convert null to undefined
      sourceId: object.sourceId || generateSlug(object.title),
      topic: object.topic ?? undefined, // Convert null to undefined
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
      topic: inputData.metadata.topic,
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
 * 1. Retrieves content using Content Retrieval Agent (routes YouTube → transcriber, web → Jina Reader)
 *    - Or skips retrieval if text is provided directly
 * 2. Extracts metadata using AI
 * 3. Suspends for human review (HITL)
 * 4. Embeds approved content into the vector database
 */
export const embedDocumentWorkflow = createWorkflow({
  id: "embed-document",
  inputSchema: workflowInputSchema,
  outputSchema: embedResultSchema,
})
  .then(retrieveContentStep)
  .then(extractMetadataStep)
  .then(humanReviewStep)
  .then(embedContentStep)
  .commit();
