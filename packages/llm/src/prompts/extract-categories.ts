import { generateText, Output } from "ai";
import { z } from "zod";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

const ExtractedCategoriesSchema = z.object({
  primaryCategory: z.string().describe("The main job category/function"),
  secondaryCategories: z
    .array(z.string())
    .describe("Array of related categories"),
  skills: z.array(z.string()).describe("Array of required skills mentioned"),
  benefits: z.array(z.string()).describe("Array of benefits/perks mentioned"),
  requirements: z
    .array(z.string())
    .describe("Array of requirements (education, experience, certifications)"),
});

export type ExtractedCategories = z.infer<typeof ExtractedCategoriesSchema>;

const SYSTEM_PROMPT = `You are an expert at extracting structured information from job postings.

Extract the following:
1. primaryCategory: The main job category/function
2. secondaryCategories: Array of related categories
3. skills: Array of required skills mentioned
4. benefits: Array of benefits/perks mentioned
5. requirements: Array of requirements (education, experience, certifications)

Be concise and specific.`;

export async function extractCategories(
  description: string
): Promise<ExtractedCategories> {
  const { output } = await generateText({
    model: DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    prompt: `Extract categories from this job description:\n\n${description.substring(0, 4000)}`,
    temperature: 0.1,
    output: Output.object({
      schema: ExtractedCategoriesSchema,
      name: "ExtractedCategories",
      description: "Extracted job posting categories and metadata",
    }),
  });

  return output;
}
