import { z } from "zod";

/**
 * Next.js environment variable schema
 * Used by: apps/web
 */

// Server-side env vars
export const nextjsServerEnvSchema = {
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_URL: z.string().optional(),
  PORT: z.coerce.number().default(3000),
};

// Client-side env vars (NEXT_PUBLIC_ prefix)
export const nextjsClientEnvSchema = {
  NEXT_PUBLIC_APP_URL: z.string().url(),
};

export const nextjsServerEnvRuntime = {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  PORT: process.env.PORT,
};

export const nextjsClientEnvRuntime = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};
