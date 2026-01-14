import { DEFAULT_MODEL, openai } from "../client";
import { parseStructuredOutput } from "../parsers/structured-output";

export interface OrgClassificationResult {
  isImpact: boolean;
  confidence: number;
  reason: string;
  suggestedCategories: string[];
}

const SYSTEM_PROMPT = `You are an expert at classifying organizations based on their mission and impact.
An "impact organization" is one that primarily focuses on:
- Social good / social impact
- Environmental sustainability / climate action
- Nonprofit / NGO work
- International development
- Human rights
- Public health initiatives
- Education access
- Poverty alleviation
- Any work aligned with UN Sustainable Development Goals

Organizations that are purely commercial without a social/environmental mission are NOT impact organizations.

Respond in JSON format with:
- isImpact: boolean (true if this is an impact organization)
- confidence: number (0-1, how confident you are)
- reason: string (brief explanation)
- suggestedCategories: string[] (relevant impact categories)
`;

export async function classifyOrganization(input: {
  name: string;
  description?: string;
  url?: string;
}): Promise<OrgClassificationResult> {
  const userPrompt = `
Organization Name: ${input.name}
${input.description ? `Description: ${input.description}` : ""}
${input.url ? `Website: ${input.url}` : ""}

Classify this organization.
`;

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || "{}";
  return parseStructuredOutput<OrgClassificationResult>(content, {
    isImpact: false,
    confidence: 0,
    reason: "Failed to classify",
    suggestedCategories: [],
  });
}
