import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { llmEnvRuntime, llmEnvSchema } from "../schemas/llm";
import { triggerEnvRuntime, triggerEnvSchema } from "../schemas/trigger";

/**
 * Environment variables for @baito/worker (Trigger.dev)
 *
 * Required env vars:
 * - TRIGGER_SECRET_KEY
 * - OPENAI_API_KEY
 *
 * Optional env vars:
 * - JINA_API_KEY (for web search tool)
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ...llmEnvSchema,
    ...triggerEnvSchema,
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ...llmEnvRuntime,
    ...triggerEnvRuntime,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
});

export type WorkerEnv = typeof env;
