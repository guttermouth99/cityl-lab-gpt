import { z } from "zod";

/**
 * Search (Typesense) environment variable schema
 * Used by: @baito/search package
 */
export const searchEnvSchema = {
  TYPESENSE_HOST: z.string().default("localhost"),
  TYPESENSE_PORT: z.coerce.number().default(8108),
  TYPESENSE_PROTOCOL: z.enum(["http", "https"]).default("http"),
  TYPESENSE_API_KEY: z.string().min(1),
};

export const searchEnvRuntime = {
  TYPESENSE_HOST: process.env.TYPESENSE_HOST,
  TYPESENSE_PORT: process.env.TYPESENSE_PORT,
  TYPESENSE_PROTOCOL: process.env.TYPESENSE_PROTOCOL,
  TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
};
