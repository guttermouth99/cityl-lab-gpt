/**
 * RAG Configuration
 *
 * Centralized configuration for Jina AI embedding and chunking settings.
 */

/**
 * Jina API key from environment variable
 */
export const jinaApiKey = process.env.JINA_API_KEY;

/**
 * Jina embedding model to use
 * Default: jina-embeddings-v3 (supports Matryoshka representations)
 */
export const jinaEmbeddingModel =
  process.env.JINA_EMBEDDING_MODEL ?? "jina-embeddings-v3";

/**
 * Embedding dimensions (Matryoshka supported: 32, 64, 128, 256, 512, 768, 1024)
 * Default: 256 (98.9% of full quality with 4x less storage)
 */
export const jinaEmbeddingDimensions = Number(
  process.env.JINA_EMBEDDING_DIMENSIONS ?? 256
);

/**
 * Maximum tokens per chunk for the Jina Segmenter
 * Default: 2000 tokens
 */
export const jinaMaxContextTokens = 2000;

/**
 * Maximum number of documents per batch embedding request
 * Default: 100
 */
export const jinaMaxDocumentsPerRequest = 100;

/**
 * Jina Segmenter API endpoint
 */
export const jinaSegmenterEndpoint = "https://api.jina.ai/v1/segment";

/**
 * Jina Embedding API endpoint
 */
export const jinaEmbeddingEndpoint = "https://api.jina.ai/v1/embeddings";

/**
 * Configuration object for easy import
 */
export const config = {
  jinaApiKey,
  jinaEmbeddingModel,
  jinaEmbeddingDimensions,
  jinaMaxContextTokens,
  jinaMaxDocumentsPerRequest,
  jinaSegmenterEndpoint,
  jinaEmbeddingEndpoint,
} as const;
