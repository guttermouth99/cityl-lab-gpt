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
  /** Chunk index within the document */
  chunkIndex: number;
}

/**
 * Options for the embedding pipeline
 */
export interface EmbedOptions {
  /** Maximum size of each chunk in characters */
  maxChunkSize?: number;
  /** Overlap between chunks in characters */
  chunkOverlap?: number;
  /** Chunking strategy */
  strategy?: "recursive" | "markdown" | "sentence";
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
 */
export interface EmbedDocumentInput {
  /** URL of the document to fetch and embed */
  url: string;
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
  /** URL that was processed */
  url: string;
}
