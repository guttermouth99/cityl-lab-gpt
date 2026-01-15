import { z } from "zod";

/**
 * Database environment variable schema
 * Used by: @baito/db package
 */
export const dbEnvSchema = {
  DATABASE_URL: z.string().url().startsWith("postgres"),
};

export const dbEnvRuntime = {
  DATABASE_URL: process.env.DATABASE_URL,
};
