import { generateObject, type LanguageModelV1 } from "ai";
import type { ZodSchema, z } from "zod";
import { DEFAULT_MODEL, openai } from "../client";

/**
 * Generate structured output using AI SDK with Zod schema
 */
export async function generateStructuredOutput<T extends ZodSchema>(
  schema: T,
  prompt: string,
  options?: {
    model?: LanguageModelV1;
    schemaName?: string;
    schemaDescription?: string;
    temperature?: number;
  }
): Promise<z.infer<T>> {
  const { object } = await generateObject({
    model: options?.model ?? openai(DEFAULT_MODEL),
    schema,
    schemaName: options?.schemaName,
    schemaDescription: options?.schemaDescription,
    prompt,
    temperature: options?.temperature ?? 0.1,
  });

  return object;
}

/**
 * Generate structured output with streaming support
 */
export async function generateStructuredOutputStream<T extends ZodSchema>(
  schema: T,
  prompt: string,
  options?: {
    model?: LanguageModelV1;
    schemaName?: string;
    schemaDescription?: string;
    temperature?: number;
  }
): Promise<{
  partialObjectStream: AsyncIterable<Partial<z.infer<T>>>;
  object: Promise<z.infer<T>>;
}> {
  const result = await generateObject({
    model: options?.model ?? openai(DEFAULT_MODEL),
    schema,
    schemaName: options?.schemaName,
    schemaDescription: options?.schemaDescription,
    prompt,
    temperature: options?.temperature ?? 0.1,
  });

  return {
    partialObjectStream: result.partialObjectStream,
    object: result.object,
  };
}
