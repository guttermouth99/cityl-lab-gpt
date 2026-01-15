import { createEnv } from "@t3-oss/env-nextjs";
import { authEnvRuntime, authEnvSchema } from "../schemas/auth";
import { dbEnvRuntime, dbEnvSchema } from "../schemas/db";
import {
  nextjsClientEnvRuntime,
  nextjsClientEnvSchema,
  nextjsServerEnvRuntime,
  nextjsServerEnvSchema,
} from "../schemas/nextjs";
import { searchEnvRuntime, searchEnvSchema } from "../schemas/search";

/**
 * Environment variables for @baito/web (Next.js app)
 *
 * Composes: db + search + auth + nextjs
 *
 * Required env vars:
 * - DATABASE_URL
 * - TYPESENSE_API_KEY
 * - BETTER_AUTH_URL
 * - BETTER_AUTH_SECRET
 * - NEXT_PUBLIC_APP_URL
 *
 * Optional env vars:
 * - TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL (have defaults)
 * - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 * - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * - VERCEL_URL, PORT
 */
export const env = createEnv({
  server: {
    ...dbEnvSchema,
    ...searchEnvSchema,
    ...authEnvSchema,
    ...nextjsServerEnvSchema,
  },
  client: {
    ...nextjsClientEnvSchema,
  },
  runtimeEnv: {
    ...dbEnvRuntime,
    ...searchEnvRuntime,
    ...authEnvRuntime,
    ...nextjsServerEnvRuntime,
    ...nextjsClientEnvRuntime,
  },
  // Skip validation in Edge runtime, during build, or when explicitly disabled
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
});

export type WebEnv = typeof env;
