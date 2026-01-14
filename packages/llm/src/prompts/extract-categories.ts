import { DEFAULT_MODEL, openai } from "../client";
import { parseStructuredOutput } from "../parsers/structured-output";

export interface ExtractedCategories {
  primaryCategory: string;
  secondaryCategories: string[];
  skills: string[];
  benefits: string[];
  requirements: string[];
}

const SYSTEM_PROMPT = `You are an expert at extracting structured information from job postings.

Extract the following:
1. primaryCategory: The main job category/function
2. secondaryCategories: Array of related categories
3. skills: Array of required skills mentioned
4. benefits: Array of benefits/perks mentioned
5. requirements: Array of requirements (education, experience, certifications)

Be concise and specific. Respond in JSON format.
`;

export async function extractCategories(
  description: string
): Promise<ExtractedCategories> {
  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract categories from this job description:\n\n${description.substring(0, 4000)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || "{}";
  return parseStructuredOutput<ExtractedCategories>(content, {
    primaryCategory: "Unknown",
    secondaryCategories: [],
    skills: [],
    benefits: [],
    requirements: [],
  });
}
