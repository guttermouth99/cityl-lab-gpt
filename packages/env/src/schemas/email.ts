import { z } from "zod";

/**
 * Email (SendGrid) environment variable schema
 * Used by: @baito/email package
 */
export const emailEnvSchema = {
  SENDGRID_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email().default("noreply@baito.jobs"),
  EMAIL_FROM_NAME: z.string().default("Baito Jobs"),
  UNSUBSCRIBE_URL: z.string().url().default("https://baito.jobs/unsubscribe"),
};

export const emailEnvRuntime = {
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  UNSUBSCRIBE_URL: process.env.UNSUBSCRIBE_URL,
};
