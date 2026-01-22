import { z } from "zod";

/**
 * LLM environment variable schema
 * Used by: @baito/mastra package
 */
export const llmEnvSchema = {
  OPENAI_API_KEY: z.string().min(1),
  JINA_API_KEY: z.string().optional(),
  // Jina embedding configuration (optional - uses defaults if not set)
  JINA_EMBEDDING_MODEL: z.string().optional().default("jina-embeddings-v3"),
  JINA_EMBEDDING_DIMENSIONS: z.coerce.number().optional().default(256), // Matryoshka - 98.9% quality
};

export const llmEnvRuntime = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  JINA_API_KEY: process.env.JINA_API_KEY,
  JINA_EMBEDDING_MODEL: process.env.JINA_EMBEDDING_MODEL,
  JINA_EMBEDDING_DIMENSIONS: process.env.JINA_EMBEDDING_DIMENSIONS,
};
