import { createEnv } from "@t3-oss/env-nextjs";
import { authEnvRuntime, authEnvSchema } from "../schemas/auth";
import { dbEnvRuntime, dbEnvSchema } from "../schemas/db";
import {
  nextjsClientEnvRuntime,
  nextjsClientEnvSchema,
  nextjsServerEnvRuntime,
  nextjsServerEnvSchema,
} from "../schemas/nextjs";

/**
 * Environment variables for @baito/web (Next.js app)
 *
 * Required env vars:
 * - DATABASE_URL
 * - BETTER_AUTH_URL
 * - BETTER_AUTH_SECRET
 * - NEXT_PUBLIC_APP_URL
 *
 * Optional env vars:
 * - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 * - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * - VERCEL_URL, PORT
 */
export const env = createEnv({
  server: {
    ...dbEnvSchema,
    ...authEnvSchema,
    ...nextjsServerEnvSchema,
  },
  client: {
    ...nextjsClientEnvSchema,
  },
  runtimeEnv: {
    ...dbEnvRuntime,
    ...authEnvRuntime,
    ...nextjsServerEnvRuntime,
    ...nextjsClientEnvRuntime,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
});

export type WebEnv = typeof env;
