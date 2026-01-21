import { openai } from "@ai-sdk/openai";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";

import { pgVector } from "../vector";
import type {
  CityLabChunkMetadata,
  CityLabContent,
  EmbedOptions,
  EmbedResult,
} from "./types";

const DEFAULT_OPTIONS: Required<EmbedOptions> = {
  maxChunkSize: 512,
  chunkOverlap: 50,
  strategy: "recursive",
};

/**
 * Embed a single piece of CityLAB content into the vector database
 */
export async function embedContent(
  content: CityLabContent,
  options: EmbedOptions = {}
): Promise<EmbedResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Create document from content (handles both plain text and markdown)
    const doc = content.content.includes("#")
      ? MDocument.fromMarkdown(content.content)
      : MDocument.fromText(content.content);

    // Chunk the document
    const chunks = await doc.chunk({
      strategy: opts.strategy,
      maxSize: opts.maxChunkSize,
      overlap: opts.chunkOverlap,
    });

    if (chunks.length === 0) {
      return {
        chunksCreated: 0,
        contentId: content.id,
        success: true,
      };
    }

    // Generate embeddings for all chunks
    // Using 512 dimensions to match the citylab_content index
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunks.map((chunk) => chunk.text),
      providerOptions: {
        openai: {
          dimensions: 512,
        },
      },
    });

    // Prepare metadata for each chunk
    const metadata: CityLabChunkMetadata[] = chunks.map((chunk, index) => ({
      text: chunk.text,
      sourceId: content.id,
      title: content.title,
      url: content.url,
      contentType: content.contentType,
      language: content.language,
      publishedAt: content.publishedAt,
      tags: content.tags,
      author: content.author,
      topic: content.topic,
      chunkIndex: index,
    }));

    // Generate unique IDs for each chunk
    const ids = chunks.map((_, index) => `${content.id}_chunk_${index}`);

    // Upsert embeddings into the vector database
    await pgVector.upsert({
      indexName: "citylab_content",
      vectors: embeddings,
      metadata,
      ids,
    });

    return {
      chunksCreated: chunks.length,
      contentId: content.id,
      success: true,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      chunksCreated: 0,
      contentId: content.id,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Embed multiple pieces of CityLAB content into the vector database
 * Processes content sequentially to avoid rate limiting
 */
export async function embedCityLabContent(
  contents: CityLabContent[],
  options: EmbedOptions = {}
): Promise<EmbedResult[]> {
  const results: EmbedResult[] = [];

  for (const content of contents) {
    const result = await embedContent(content, options);
    results.push(result);

    // Log progress
    if (result.success) {
      console.log(
        `✓ Embedded "${content.title}" (${result.chunksCreated} chunks)`
      );
    } else {
      console.error(`✗ Failed to embed "${content.title}": ${result.error}`);
    }
  }

  return results;
}

/**
 * Delete all chunks associated with a specific content ID
 */
export async function deleteContentChunks(contentId: string): Promise<void> {
  await pgVector.deleteVectors({
    indexName: "citylab_content",
    filter: { sourceId: contentId },
  });
}

/**
 * Re-embed content by deleting existing chunks and creating new ones
 */
export async function reembedContent(
  content: CityLabContent,
  options: EmbedOptions = {}
): Promise<EmbedResult> {
  // First delete existing chunks
  await deleteContentChunks(content.id);

  // Then embed the new content
  return embedContent(content, options);
}

/**
 * Get statistics about the embedded content
 */
export async function getEmbeddingStats(): Promise<{
  totalChunks: number;
  indexExists: boolean;
}> {
  try {
    const indexInfo = await pgVector.describeIndex({
      indexName: "citylab_content",
    });
    return {
      totalChunks: indexInfo.count,
      indexExists: true,
    };
  } catch {
    return {
      totalChunks: 0,
      indexExists: false,
    };
  }
}
