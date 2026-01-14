import { generateText, Output } from "ai";
import { z } from "zod";

const DEFAULT_MODEL = "openai/gpt-4o-mini";

// Example schema for structured output
const JobAnalysisSchema = z.object({
  title: z.string().describe("The job title"),
  category: z.enum(["tech", "healthcare", "education", "finance", "other"]),
  experienceLevel: z
    .enum(["entry", "mid", "senior", "executive"])
    .describe("Required experience level"),
  skills: z.array(z.string()).describe("Required skills"),
  salary: z
    .object({
      min: z.number().nullable(),
      max: z.number().nullable(),
      currency: z.string().default("USD"),
    })
    .describe("Salary range"),
  isRemote: z.boolean().describe("Whether the position is remote"),
  benefits: z.array(z.string()).describe("List of benefits offered"),
  relevantSDGs: z
    .array(z.number().min(1).max(17))
    .describe("Relevant UN SDG numbers"),
});

export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;

/**
 * Example function using generateText with Output.object() (AI SDK 6)
 */
export async function analyzeJobPosting(input: {
  title: string;
  description: string;
}): Promise<JobAnalysis> {
  const { output } = await generateText({
    model: DEFAULT_MODEL,
    prompt: `Analyze this job posting and extract structured information.

Job Title: ${input.title}

Description:
${input.description}

Extract all relevant details following the schema.`,
    output: Output.object({
      schema: JobAnalysisSchema,
    }),
  });

  return output;
}

// Alternative: using name and description for better model understanding
export async function analyzeJobPostingWithContext(input: {
  title: string;
  description: string;
}): Promise<JobAnalysis> {
  const { output } = await generateText({
    model: DEFAULT_MODEL,
    prompt: `Analyze this job posting: ${input.title}

${input.description}`,
    temperature: 0.1,
    output: Output.object({
      schema: JobAnalysisSchema,
      name: "JobAnalysis",
      description: "Structured analysis of a job posting",
    }),
  });

  return output;
}
