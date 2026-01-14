import { generateText, Output } from "ai";
import { z } from "zod/v4";
import { DEFAULT_MODEL } from "../client.js";

/**
 * Example classification schema using Zod v4
 * AI SDK v6 uses generateText with Output.object for structured outputs
 */
const classificationSchema = z.object({
  category: z
    .enum(["technology", "business", "health", "entertainment", "sports"])
    .describe("The primary category of the content"),
  sentiment: z
    .enum(["positive", "negative", "neutral"])
    .describe("Overall sentiment of the content"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score between 0 and 1"),
  keywords: z.array(z.string()).max(5).describe("Up to 5 relevant keywords"),
  summary: z
    .string()
    .max(200)
    .describe("Brief summary in under 200 characters"),
});

export type ClassificationResult = z.infer<typeof classificationSchema>;

/**
 * Classify content using AI SDK v6's generateText with Output.object
 *
 * @example
 * ```ts
 * const result = await classifyContent("Apple announced new iPhone features...");
 * console.log(result.category); // "technology"
 * console.log(result.sentiment); // "positive"
 * ```
 */
export async function classifyContent(
  content: string
): Promise<ClassificationResult> {
  const { output } = await generateText({
    model: `openai:${DEFAULT_MODEL}`,
    output: Output.object({
      schema: classificationSchema,
    }),
    prompt: `Classify the following content:\n\n${content}`,
    temperature: 0.1,
  });

  if (!output) {
    throw new Error("Failed to generate classification output");
  }

  return output;
}

/**
 * Batch classify multiple pieces of content
 */
export async function classifyContentBatch(
  contents: string[]
): Promise<ClassificationResult[]> {
  const results = await Promise.all(contents.map(classifyContent));
  return results;
}
