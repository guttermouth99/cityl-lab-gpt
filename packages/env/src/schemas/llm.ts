import { z } from "zod";

/**
 * LLM environment variable schema
 * Used by: @baito/mastra package
 */
export const llmEnvSchema = {
  OPENAI_API_KEY: z.string().min(1),
  JINA_API_KEY: z.string().optional(),
};

export const llmEnvRuntime = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  JINA_API_KEY: process.env.JINA_API_KEY,
};
