/**
 * Content types for CityLAB Berlin knowledge base
 */
export type CityLabContentType =
  | "blog"
  | "project"
  | "youtube_transcript"
  | "event"
  | "page"
  | "exhibition"
  | "team"
  | "newsletter";

/**
 * Supported languages for CityLAB content
 */
export type CityLabLanguage = "de" | "en";

/**
 * Topic areas for CityLAB Berlin content
 */
export type CityLabTopic =
  | "smart-city"
  | "innovative-administration"
  | "open-cities"
  | "kiezlabor"
  | "open-data"
  | "digital-collaboration"
  | "events-networking";

/**
 * Represents a piece of content from CityLAB Berlin
 * to be indexed in the vector database
 */
export interface CityLabContent {
  /** Unique identifier for the content piece */
  id: string;
  /** Title of the content */
  title: string;
  /** Raw text/markdown content to be chunked and embedded */
  content: string;
  /** Original URL of the content */
  url: string;
  /** Type of content for filtering */
  contentType: CityLabContentType;
  /** Language of the content */
  language: CityLabLanguage;
  /** Publication date in ISO 8601 format */
  publishedAt?: string;
  /** Tags/categories for the content */
  tags?: string[];
  /** Author or team member name */
  author?: string;
  /** Short description or excerpt */
  description?: string;
  /** Topic area for the content */
  topic?: CityLabTopic;
}

/**
 * Metadata stored with each vector chunk in pgvector
 */
export interface CityLabChunkMetadata {
  /** The actual text content of this chunk */
  text: string;
  /** Reference to the parent content ID */
  sourceId: string;
  /** Title from parent content */
  title: string;
  /** URL of the original content */
  url: string;
  /** Content type for filtering */
  contentType: CityLabContentType;
  /** Language for filtering */
  language: CityLabLanguage;
  /** Publication date for temporal queries */
  publishedAt?: string;
  /** Tags for categorical filtering */
  tags?: string[];
  /** Author information */
  author?: string;
  /** Topic area for filtering */
  topic?: CityLabTopic;
  /** Chunk index within the document */
  chunkIndex: number;
}

/**
 * Options for the embedding pipeline
 */
export interface EmbedOptions {
  /** Chunking strategy to use */
  chunkingStrategy?: "segmenter" | "markdown" | "recursive" | "fixed";
  /** Maximum tokens per chunk (default: 2000) */
  maxTokensPerChunk?: number;
  /** Minimum tokens per chunk for merging small chunks (default: 256) */
  minTokensPerChunk?: number;
}

/**
 * Result of the embedding operation
 */
export interface EmbedResult {
  /** Number of chunks created */
  chunksCreated: number;
  /** Content ID that was processed */
  contentId: string;
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Document Embedding Workflow Types
// ============================================================================

/**
 * Input payload for the embed-document Trigger.dev task
 * Either url OR text must be provided (mutually exclusive)
 */
export interface EmbedDocumentInput {
  /** URL of the document to fetch and embed */
  url?: string;
  /** Direct text content to embed (skips external retrieval) */
  text?: string;
  /** Optional title for the document (used when text is provided) */
  title?: string;
  /** Optional source URL for citation (used when text is provided) */
  source?: string;
}

/**
 * Metadata extracted from document content using AI
 */
export interface ExtractedDocumentMetadata {
  /** Title of the document */
  title: string;
  /** Author if found in the content */
  author?: string;
  /** Relevant tags/keywords */
  tags: string[];
  /** Content type classification */
  contentType: CityLabContentType;
  /** Language of the content */
  language: CityLabLanguage;
  /** Publication date if found (ISO 8601) */
  publishedAt?: string;
  /** Generated source ID (slug from title) */
  sourceId: string;
  /** Topic area for the content */
  topic?: CityLabTopic;
}

/**
 * Data extracted from URL and sent for human review
 */
export interface ExtractedDocumentData {
  /** Raw content from Jina Reader */
  content: string;
  /** AI-extracted metadata */
  metadata: ExtractedDocumentMetadata;
  /** Original URL */
  url: string;
  /** Content preview (first N characters) */
  preview: string;
}

/**
 * Payload sent when completing the review waitpoint token
 */
export interface DocumentReviewPayload {
  /** Whether the document was approved for embedding */
  approved: boolean;
  /** Optionally edited metadata (if approved) */
  metadata?: ExtractedDocumentMetadata;
  /** Reason for rejection (if not approved) */
  rejectionReason?: string;
}

/**
 * Output from the embed-document task
 */
export interface EmbedDocumentOutput {
  /** Whether the workflow completed successfully */
  success: boolean;
  /** Status of the embedding */
  status: "embedded" | "rejected" | "error";
  /** Number of chunks created (if embedded) */
  chunksCreated?: number;
  /** Source ID of the embedded content */
  sourceId?: string;
  /** Error message if failed */
  error?: string;
  /** URL that was processed (or "text://user-provided" for text input) */
  url: string;
}

// ============================================================================
// Jina AI API Types
// ============================================================================

/**
 * Jina Segmenter API request
 */
export interface JinaSegmenterRequest {
  /** The text content to segment */
  content: string;
  /** Whether to return the chunks array (default: false) */
  return_chunks?: boolean;
  /** Whether to return detailed token breakdown (default: false) */
  return_tokens?: boolean;
  /** Maximum chunk length in tokens (default: 1000) */
  max_chunk_length?: number;
  /** Tokenizer to use: "o200k_base" (GPT-4o) or "cl100k_base" (GPT-4) */
  tokenizer?: "o200k_base" | "cl100k_base";
}

/**
 * Jina Segmenter API response
 */
export interface JinaSegmenterResponse {
  /** Total number of tokens in the input */
  num_tokens: number;
  /** Tokenizer used (e.g., "cl100k_base", "o200k_base") */
  tokenizer: string;
  /** Token usage stats */
  usage: {
    tokens: number;
  };
  /** Number of chunks created */
  num_chunks: number;
  /** Character positions for each chunk: [start, end] */
  chunk_positions: [number, number][];
  /** Optional detailed token breakdown per chunk */
  tokens?: [string, number[]][][];
  /** The actual text chunks */
  chunks: string[];
}

/**
 * Jina Embedding API request
 */
export interface JinaEmbeddingRequest {
  /** Embedding model to use */
  model: string;
  /** Input text(s) - string, array of strings, or array of {text: string} objects */
  input: string | string[] | Array<{ text: string }>;
  /** Task type for optimized embeddings */
  task:
    | "retrieval.passage"
    | "retrieval.query"
    | "separation"
    | "classification"
    | "text-matching";
  /** Output dimensions - Matryoshka supported: 32, 64, 128, 256, 512, 768, 1024 */
  dimensions?: number;
  /** Whether to use late chunking (default: false) */
  late_chunking?: boolean;
  /** Embedding output type */
  embedding_type?: "float" | "base64" | "binary" | "ubinary";
  /** Whether to truncate input if exceeds max length (default: true) */
  truncate?: boolean;
}

/**
 * Jina Embedding API response
 */
export interface JinaEmbeddingResponse {
  model: string;
  object: string;
  data: Array<{
    index: number;
    embedding: number[];
    object: string;
  }>;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
}

/**
 * Single embedding result (internal)
 */
export interface EmbeddingResponse {
  embedding: number[];
  tokenUsage: number;
}

/**
 * Batch embeddings result (internal)
 */
export interface EmbeddingsResponse {
  embeddings: number[][];
  tokenUsage: number;
}

/**
 * Internal chunk representation for batch processing
 */
export interface Chunk {
  content: string;
  page?: number;
  chunkIndex: number;
  tokenCount: number;
}
