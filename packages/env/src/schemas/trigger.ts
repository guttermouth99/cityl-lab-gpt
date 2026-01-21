import { z } from "zod";

/**
 * Trigger.dev environment variable schema
 * Used by: apps/worker
 */
export const triggerEnvSchema = {
  TRIGGER_SECRET_KEY: z.string().min(1),
};

export const triggerEnvRuntime = {
  TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
};
