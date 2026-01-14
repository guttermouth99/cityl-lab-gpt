import { generateText, Output } from "ai";
import { z } from "zod";

const DEFAULT_MODEL = "openai/gpt-4o";

// Example schema for structured output
const JobAnalysisSchema = z.object({
  title: z.string().describe("The job title"),
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
    output: Output.object({
      schema: JobAnalysisSchema,
    }),
    prompt: `Analyze this job posting and extract structured information.

Job Title: ${input.title}

Description:
${input.description}

Extract all relevant details following the schema.`,
  });

  if (!output) {
    throw new Error("Failed to generate structured job analysis");
  }

  return output;
}

// Alternative: using name and description for better model understanding
export async function analyzeJobPostingWithContext(input: {
  title: string;
  description: string;
}): Promise<JobAnalysis> {
  const { output } = await generateText({
    model: DEFAULT_MODEL,
    output: Output.object({
      schema: JobAnalysisSchema,
      name: "JobAnalysis",
      description: "Structured analysis of a job posting",
    }),
    prompt: `Analyze this job posting: ${input.title}

${input.description}`,
  });

  if (!output) {
    throw new Error("Failed to generate structured job analysis");
  }

  return output;
}
