import { generateText, Output } from "ai";
import { z } from "zod";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

const OrgClassificationSchema = z.object({
  isImpact: z.boolean().describe("True if this is an impact organization"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score between 0 and 1"),
  reason: z.string().describe("Brief explanation for the classification"),
  suggestedCategories: z
    .array(z.string())
    .describe("Relevant impact categories"),
});

export type OrgClassificationResult = z.infer<typeof OrgClassificationSchema>;

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

Organizations that are purely commercial without a social/environmental mission are NOT impact organizations.`;

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

  const { output } = await generateText({
    model: DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.1,
    output: Output.object({
      schema: OrgClassificationSchema,
      name: "OrgClassification",
      description: "Classification of an organization's impact status",
    }),
  });

  return output;
}
