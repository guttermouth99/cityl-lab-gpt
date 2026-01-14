import {
  EXPERIENCE_LEVELS,
  JOB_BRANCHES,
  JOB_TYPES,
  REMOTE_TYPES,
} from "@baito/shared";
import { generateObject } from "ai";
import { z } from "zod";
import { DEFAULT_MODEL, openai } from "../client";

const JobClassificationSchema = z.object({
  jobType: z
    .enum(Object.values(JOB_TYPES) as [string, ...string[]])
    .nullable()
    .describe("Type of job position"),
  jobBranch: z
    .enum(Object.values(JOB_BRANCHES) as [string, ...string[]])
    .nullable()
    .describe("Primary industry/sector"),
  remoteType: z
    .enum(Object.values(REMOTE_TYPES) as [string, ...string[]])
    .nullable()
    .describe("Remote work arrangement"),
  experienceLevel: z
    .enum(Object.values(EXPERIENCE_LEVELS) as [string, ...string[]])
    .nullable()
    .describe("Required experience level"),
  keywords: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Relevant keywords for search"),
  sdgs: z.array(z.number().min(1).max(17)).describe("Relevant UN SDG numbers"),
});

export type JobClassificationResult = z.infer<typeof JobClassificationSchema>;

export async function classifyJob(input: {
  title: string;
  description: string;
  organizationName?: string;
}): Promise<JobClassificationResult> {
  const prompt = `Classify this job posting:

Job Title: ${input.title}
${input.organizationName ? `Organization: ${input.organizationName}` : ""}

Description:
${input.description.substring(0, 3000)}

Extract classification details following the schema.`;

  const { object } = await generateObject({
    model: openai(DEFAULT_MODEL),
    schema: JobClassificationSchema,
    schemaName: "JobClassification",
    schemaDescription: "Classification metadata for a job posting",
    prompt,
    temperature: 0.1,
  });

  return object;
}
