import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { dbEnvRuntime, dbEnvSchema } from "../schemas/db.js";

/**
 * Environment variables for @baito/server (Express API)
 *
 * Composes: db + server-specific
 *
 * Required env vars:
 * - DATABASE_URL
 *
 * Optional env vars:
 * - PORT (default: 4000)
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(4000),
    ...dbEnvSchema,
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ...dbEnvRuntime,
  },
  // Skip validation when explicitly disabled
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
});

export type ServerEnv = typeof env;
