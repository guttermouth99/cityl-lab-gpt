import { generateObject } from "ai";
import { z } from "zod";
import { DEFAULT_MODEL, openai } from "../client";

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
 * Example function using generateObject with Zod schema
 */
export async function analyzeJobPosting(input: {
  title: string;
  description: string;
}): Promise<JobAnalysis> {
  const { object } = await generateObject({
    model: openai(DEFAULT_MODEL),
    schema: JobAnalysisSchema,
    prompt: `Analyze this job posting and extract structured information.

Job Title: ${input.title}

Description:
${input.description}

Extract all relevant details following the schema.`,
  });

  return object;
}

// Alternative: using schemaName and schemaDescription for better model understanding
export async function analyzeJobPostingWithContext(input: {
  title: string;
  description: string;
}): Promise<JobAnalysis> {
  const { object } = await generateObject({
    model: openai(DEFAULT_MODEL),
    schema: JobAnalysisSchema,
    schemaName: "JobAnalysis",
    schemaDescription: "Structured analysis of a job posting",
    prompt: `Analyze this job posting: ${input.title}

${input.description}`,
    temperature: 0.1,
  });

  return object;
}

// Example with streaming for partial results
export async function* analyzeJobPostingStream(input: {
  title: string;
  description: string;
}): AsyncGenerator<Partial<JobAnalysis>, JobAnalysis> {
  const { partialObjectStream, object } = await generateObject({
    model: openai(DEFAULT_MODEL),
    schema: JobAnalysisSchema,
    prompt: `Analyze: ${input.title}\n\n${input.description}`,
  });

  for await (const partialObject of partialObjectStream) {
    yield partialObject;
  }

  return object;
}
