import { z } from "zod";

/**
 * LLM environment variable schema
 * Used by: @baito/llm package
 */
export const llmEnvSchema = {
  JINA_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  AI_GATEWAY_API_KEY: z.string().optional(),
};

export const llmEnvRuntime = {
  JINA_API_KEY: process.env.JINA_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
};
