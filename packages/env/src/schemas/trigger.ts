import { z } from "zod";

/**
 * Trigger.dev environment variable schema
 * Used by: apps/worker
 */
export const triggerEnvSchema = {
  TRIGGER_SECRET_KEY: z.string().min(1),
  STEPSTONE_FEED_URL: z.string().url().optional(),
};

export const triggerEnvRuntime = {
  TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
  STEPSTONE_FEED_URL: process.env.STEPSTONE_FEED_URL,
};
