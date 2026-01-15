import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { dbEnvRuntime, dbEnvSchema } from "../schemas/db.js";
import { emailEnvRuntime, emailEnvSchema } from "../schemas/email.js";
import { llmEnvRuntime, llmEnvSchema } from "../schemas/llm.js";
import { searchEnvRuntime, searchEnvSchema } from "../schemas/search.js";
import { triggerEnvRuntime, triggerEnvSchema } from "../schemas/trigger.js";

/**
 * Environment variables for @baito/worker (Trigger.dev)
 *
 * Composes: db + search + email + llm + trigger
 *
 * Required env vars:
 * - DATABASE_URL
 * - TYPESENSE_API_KEY
 * - SENDGRID_API_KEY
 * - JINA_API_KEY
 * - TRIGGER_SECRET_KEY
 *
 * Optional env vars:
 * - TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL (have defaults)
 * - EMAIL_FROM, EMAIL_FROM_NAME, UNSUBSCRIBE_URL (have defaults)
 * - OPENAI_API_KEY, GOOGLE_API_KEY, AI_GATEWAY_API_KEY
 * - STEPSTONE_FEED_URL
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ...dbEnvSchema,
    ...searchEnvSchema,
    ...emailEnvSchema,
    ...llmEnvSchema,
    ...triggerEnvSchema,
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ...dbEnvRuntime,
    ...searchEnvRuntime,
    ...emailEnvRuntime,
    ...llmEnvRuntime,
    ...triggerEnvRuntime,
  },
  // Skip validation when explicitly disabled
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
});

export type WorkerEnv = typeof env;
