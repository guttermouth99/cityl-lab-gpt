import { generateText, Output } from "ai";
import type { ZodSchema, z } from "zod";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

/**
 * Generate structured output using AI SDK 6 with Zod schema
 * Uses generateText with Output.object() for structured outputs
 */
export async function generateStructuredOutput<T extends ZodSchema>(
  schema: T,
  prompt: string,
  options?: {
    model?: string;
    schemaName?: string;
    schemaDescription?: string;
    temperature?: number;
  }
): Promise<z.infer<T>> {
  const { output } = await generateText({
    model: options?.model ?? DEFAULT_MODEL,
    prompt,
    temperature: options?.temperature ?? 0.1,
    output: Output.object({
      schema,
      name: options?.schemaName,
      description: options?.schemaDescription,
    }),
  });

  return output as z.infer<T>;
}
