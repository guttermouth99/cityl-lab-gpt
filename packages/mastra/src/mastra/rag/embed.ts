/**
 * Jina AI Embedding Service
 *
 * Provides chunking and embedding functionality using Jina AI APIs:
 * - Jina Segmenter for AI-powered semantic chunking
 * - Jina Embeddings v3 with Matryoshka representation support
 */

import { pgVector } from "../vector";
import { config } from "./config";
import { countTokens, trimToTokenLimitByWords } from "./token-utils";
import type {
  Chunk,
  CityLabChunkMetadata,
  CityLabContent,
  EmbeddingResponse,
  EmbeddingsResponse,
  EmbedOptions,
  EmbedResult,
  JinaEmbeddingResponse,
  JinaSegmenterResponse,
} from "./types";

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_OPTIONS: Required<EmbedOptions> = {
  chunkingStrategy: "segmenter",
  maxTokensPerChunk: config.jinaMaxContextTokens,
  minTokensPerChunk: 256,
};

// ============================================================================
// Pre-compiled Regex Patterns (for performance)
// ============================================================================

const WORD_SPLIT_REGEX = /\s+/;
const MARKDOWN_HEADER_REGEX = /(?=^#{1,6}\s)/gm;
const PARAGRAPH_SPLIT_REGEX = /\n\s*\n/;

// ============================================================================
// Jina Segmenter API
// ============================================================================

/**
 * Chunk text using Jina Segmenter API
 * Uses AI to find natural semantic breakpoints in the text
 *
 * @param text - Text to chunk
 * @param maxChunkLength - Maximum tokens per chunk (default: 2000)
 * @returns Array of text chunks
 */
export async function chunkWithJinaSegmenter(
  text: string,
  maxChunkLength: number = config.jinaMaxContextTokens
): Promise<string[]> {
  if (!config.jinaApiKey) {
    throw new Error("JINA_API_KEY environment variable is not configured");
  }

  const response = await fetch(config.jinaSegmenterEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.jinaApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: text,
      return_chunks: true,
      max_chunk_length: maxChunkLength,
      tokenizer: "o200k_base",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Jina Segmenter API error: Status ${response.status}, Body: ${errorBody}`
    );
  }

  const data = (await response.json()) as JinaSegmenterResponse;
  return data.chunks;
}

// ============================================================================
// Jina Embedding API
// ============================================================================

/**
 * Generate a single embedding using Jina AI
 *
 * @param input - Text to embed
 * @param task - Task type for optimized embeddings
 * @returns Embedding vector and token usage
 */
export async function generateJinaEmbedding(
  input: string,
  task: "retrieval.passage" | "retrieval.query" = "retrieval.passage"
): Promise<EmbeddingResponse> {
  if (!config.jinaApiKey) {
    throw new Error("JINA_API_KEY environment variable is not configured");
  }

  const response = await fetch(config.jinaEmbeddingEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.jinaApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.jinaEmbeddingModel,
      input,
      task,
      dimensions: config.jinaEmbeddingDimensions,
      late_chunking: false,
      embedding_type: "float",
      truncate: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Jina Embedding API error: Status ${response.status}, Body: ${errorBody}`
    );
  }

  const data = (await response.json()) as JinaEmbeddingResponse;

  if (!data.data || data.data.length === 0) {
    throw new Error("Jina Embedding API returned empty response");
  }

  return {
    embedding: data.data[0].embedding,
    tokenUsage: data.usage.total_tokens,
  };
}

/**
 * Generate batch embeddings using Jina AI
 *
 * @param inputs - Array of text inputs (as {text: string} objects)
 * @param task - Task type for optimized embeddings
 * @returns Array of embeddings and total token usage
 */
export async function generateJinaBatchEmbeddings(
  inputs: Array<{ text: string }>,
  task: "retrieval.passage" | "retrieval.query" = "retrieval.passage"
): Promise<EmbeddingsResponse> {
  if (!config.jinaApiKey) {
    throw new Error("JINA_API_KEY environment variable is not configured");
  }

  const response = await fetch(config.jinaEmbeddingEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.jinaApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.jinaEmbeddingModel,
      input: inputs,
      task,
      dimensions: config.jinaEmbeddingDimensions,
      late_chunking: false,
      embedding_type: "float",
      truncate: true,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Jina Embedding API error: Status ${response.status}, Body: ${errorBody}`
    );
  }

  const data = (await response.json()) as JinaEmbeddingResponse;

  if (!data.data || data.data.length === 0) {
    throw new Error("Jina Embedding API returned empty response");
  }

  // Sort by index to ensure correct order
  const sortedData = data.data.sort((a, b) => a.index - b.index);

  return {
    embeddings: sortedData.map((item) => item.embedding),
    tokenUsage: data.usage.total_tokens,
  };
}

// ============================================================================
// Chunking Strategies
// ============================================================================

/**
 * Fixed-size chunking by words
 *
 * @param content - Text to chunk
 * @param wordsPerChunk - Number of words per chunk (default: 100)
 * @returns Array of text chunks
 */
export function fixedSizeChunking(
  content: string,
  wordsPerChunk = 100
): string[] {
  const words = content.split(WORD_SPLIT_REGEX);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    const chunk = chunkWords.join(" ");
    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }
  }

  return chunks;
}

/**
 * Recursively chunks text by trying different separators in priority order.
 * If no separators work, returns empty array to skip unchunkable content.
 *
 * @param text - Text to chunk
 * @param maxTokens - Maximum tokens per chunk
 * @returns Array of text chunks
 */
export function recursiveChunking(
  text: string,
  maxTokens: number = config.jinaMaxContextTokens
): string[] {
  // Base case: if text is small enough, return as single chunk
  const textTokens = countTokens(text);
  if (textTokens <= maxTokens) {
    return text.trim() ? [text.trim()] : [];
  }

  // Early exit: if text has no word boundaries, it's unchunkable
  if (!(text.includes(" ") || text.includes("\n") || text.includes(". "))) {
    console.warn(
      `[WARNING] Skipping unchunkable content with ${textTokens} tokens (no word boundaries). Preview: ${text.slice(0, 100)}...`
    );
    return [];
  }

  // Try separators in priority order
  const separators = [
    { pattern: "\n", name: "newline" },
    { pattern: ". ", name: "sentence" },
    { pattern: " ", name: "word" },
  ];

  for (const { pattern, name } of separators) {
    if (!text.includes(pattern)) {
      continue;
    }

    const parts = text.split(pattern);
    const chunks: string[] = [];
    let currentChunk = "";

    // For word splitting, use binary search optimization
    if (name === "word") {
      let remaining = text;
      while (remaining.trim()) {
        const trimmed = trimToTokenLimitByWords(remaining, maxTokens);
        if (!trimmed) {
          break;
        }
        chunks.push(trimmed.trim());
        remaining = remaining.slice(trimmed.length).trim();
      }
      return chunks.filter((c) => c.trim().length > 0);
    }

    for (const part of parts) {
      const testChunk = currentChunk ? currentChunk + pattern + part : part;
      const testTokens = countTokens(testChunk);

      if (testTokens <= maxTokens) {
        currentChunk = testChunk;
        continue;
      }

      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = part;
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    // Recursively process chunks that are still too large
    const finalChunks: string[] = [];
    for (const chunk of chunks) {
      const chunkTokens = countTokens(chunk);
      if (chunkTokens > maxTokens) {
        finalChunks.push(...recursiveChunking(chunk, maxTokens));
      } else if (chunk.trim()) {
        finalChunks.push(chunk.trim());
      }
    }

    return finalChunks;
  }

  console.warn(
    `[WARNING] Skipping unchunkable content with ${textTokens} tokens. Preview: ${text.slice(0, 100)}...`
  );
  return [];
}

/**
 * Chunks markdown content by structural elements (headers, paragraphs)
 * while respecting token limits.
 *
 * @param content - Markdown content to chunk
 * @param maxTokens - Maximum tokens per chunk
 * @returns Array of text chunks
 */
export function markdownStructuralChunking(
  content: string,
  maxTokens: number = config.jinaMaxContextTokens
): string[] {
  const chunks: string[] = [];

  // Split by markdown headers
  const sections = content.split(MARKDOWN_HEADER_REGEX);

  let currentChunk = "";
  let currentTokens = 0;

  for (const section of sections) {
    // Further split by paragraphs (double newline)
    const paragraphs = section.split(PARAGRAPH_SPLIT_REGEX);

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) {
        continue;
      }

      const paragraphTokens = countTokens(trimmed);

      // If single paragraph exceeds max, use recursive chunking
      if (paragraphTokens > maxTokens) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
          currentTokens = 0;
        }
        const subChunks = recursiveChunking(trimmed, maxTokens);
        chunks.push(...subChunks);
        continue;
      }

      if (currentTokens + paragraphTokens > maxTokens && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmed;
        currentTokens = paragraphTokens;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
        currentTokens += paragraphTokens;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Merges small chunks into larger ones based on minimum token threshold.
 *
 * @param chunks - Array of chunk strings
 * @param minTokens - Minimum tokens per chunk (default: 256)
 * @param maxTokens - Maximum tokens per chunk
 * @returns Array of merged chunk strings
 */
export function mergeSmallChunks(
  chunks: string[],
  minTokens = 256,
  maxTokens: number = config.jinaMaxContextTokens
): string[] {
  const merged: string[] = [];
  let buffer = "";

  for (const chunk of chunks) {
    const chunkTokenCount = countTokens(chunk);

    if (chunkTokenCount >= minTokens) {
      if (buffer) {
        merged.push(buffer);
        buffer = "";
      }
      merged.push(chunk);
    } else {
      const testBuffer = buffer ? `${buffer} ${chunk}` : chunk;
      const testBufferTokens = countTokens(testBuffer);

      // If adding this chunk would exceed maxTokens, flush buffer first
      if (testBufferTokens > maxTokens && buffer) {
        merged.push(buffer);
        buffer = chunk;
      } else {
        buffer = testBuffer;
        if (testBufferTokens >= minTokens) {
          merged.push(buffer);
          buffer = "";
        }
      }
    }
  }

  if (buffer) {
    merged.push(buffer);
  }

  return merged;
}

// ============================================================================
// Main Embedding Functions
// ============================================================================

/**
 * Embed a single piece of CityLAB content into the vector database
 *
 * @param content - Content to embed
 * @param options - Embedding options
 * @returns Embed result with chunk count and status
 */
export async function embedContent(
  content: CityLabContent,
  options: EmbedOptions = {}
): Promise<EmbedResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Step 1: Chunk the content using selected strategy
    let chunkContents: string[] = [];

    if (opts.chunkingStrategy === "segmenter") {
      // Use Jina Segmenter API for AI-powered chunking
      // Fall back to markdown chunking if content is too large for segmenter
      const SEGMENTER_INPUT_MAX = 64_000;
      const SEGMENTER_SAFETY_MARGIN = 2048;

      if (
        content.content.length >
        SEGMENTER_INPUT_MAX - SEGMENTER_SAFETY_MARGIN
      ) {
        // Content too large for segmenter, use markdown chunking
        chunkContents = markdownStructuralChunking(
          content.content,
          opts.maxTokensPerChunk
        );
      } else {
        const rawChunks = await chunkWithJinaSegmenter(
          content.content,
          opts.maxTokensPerChunk
        );
        // Merge small chunks to meet minimum token threshold
        chunkContents = mergeSmallChunks(
          rawChunks,
          opts.minTokensPerChunk,
          opts.maxTokensPerChunk
        );
      }
    } else if (opts.chunkingStrategy === "markdown") {
      chunkContents = markdownStructuralChunking(
        content.content,
        opts.maxTokensPerChunk
      );
    } else if (opts.chunkingStrategy === "recursive") {
      chunkContents = recursiveChunking(
        content.content,
        opts.maxTokensPerChunk
      );
    } else if (opts.chunkingStrategy === "fixed") {
      chunkContents = fixedSizeChunking(content.content, 150);
    } else {
      // Default to segmenter
      chunkContents = markdownStructuralChunking(
        content.content,
        opts.maxTokensPerChunk
      );
    }

    if (chunkContents.length === 0) {
      return {
        chunksCreated: 0,
        contentId: content.id,
        success: true,
      };
    }

    // Step 2: Create internal chunk representations
    const allChunks: Chunk[] = chunkContents.map((chunkContent, index) => ({
      content: chunkContent,
      chunkIndex: index,
      tokenCount: countTokens(chunkContent),
    }));

    // Step 3: Filter out chunks that exceed token limit
    const validChunks = allChunks.filter((chunk) => {
      if (chunk.tokenCount > opts.maxTokensPerChunk) {
        console.warn(
          `[WARNING] Skipping chunk with ${chunk.tokenCount} tokens (exceeds ${opts.maxTokensPerChunk})`
        );
        return false;
      }
      return true;
    });

    if (validChunks.length === 0) {
      return {
        chunksCreated: 0,
        contentId: content.id,
        success: true,
      };
    }

    // Step 4: Batch process embeddings
    const batches: Chunk[][] = [];
    let currentBatch: Chunk[] = [];

    for (const chunk of validChunks) {
      if (currentBatch.length >= config.jinaMaxDocumentsPerRequest) {
        batches.push(currentBatch);
        currentBatch = [];
      }
      currentBatch.push(chunk);
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    // Step 5: Generate embeddings and upsert to vector database
    let totalChunksEmbedded = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // Generate batch embeddings using Jina
      const { embeddings } = await generateJinaBatchEmbeddings(
        batch.map((c) => ({ text: c.content })),
        "retrieval.passage"
      );

      // Prepare metadata for each chunk
      const metadata: CityLabChunkMetadata[] = batch.map((chunk, idx) => ({
        text: chunk.content,
        sourceId: content.id,
        title: content.title,
        url: content.url,
        contentType: content.contentType,
        language: content.language,
        publishedAt: content.publishedAt,
        tags: content.tags,
        author: content.author,
        topic: content.topic,
        chunkIndex: totalChunksEmbedded + idx,
      }));

      // Generate unique IDs for each chunk
      const ids = batch.map(
        (_, idx) => `${content.id}_chunk_${totalChunksEmbedded + idx}`
      );

      // Upsert embeddings into the vector database
      await pgVector.upsert({
        indexName: "citylab_content",
        vectors: embeddings,
        metadata,
        ids,
      });

      totalChunksEmbedded += batch.length;

      // Yield to event loop between batches
      if (i < batches.length - 1) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    return {
      chunksCreated: totalChunksEmbedded,
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
 *
 * @param contents - Array of content to embed
 * @param options - Embedding options
 * @returns Array of embed results
 */
export async function embedCityLabContent(
  contents: CityLabContent[],
  options: EmbedOptions = {}
): Promise<EmbedResult[]> {
  const results: EmbedResult[] = [];

  for (const content of contents) {
    const result = await embedContent(content, options);
    results.push(result);

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
 *
 * @param contentId - Content ID to delete chunks for
 */
export async function deleteContentChunks(contentId: string): Promise<void> {
  await pgVector.deleteVectors({
    indexName: "citylab_content",
    filter: { sourceId: contentId },
  });
}

/**
 * Re-embed content by deleting existing chunks and creating new ones
 *
 * @param content - Content to re-embed
 * @param options - Embedding options
 * @returns Embed result
 */
export async function reembedContent(
  content: CityLabContent,
  options: EmbedOptions = {}
): Promise<EmbedResult> {
  await deleteContentChunks(content.id);
  return embedContent(content, options);
}

/**
 * Get statistics about the embedded content
 *
 * @returns Total chunks and index existence status
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
