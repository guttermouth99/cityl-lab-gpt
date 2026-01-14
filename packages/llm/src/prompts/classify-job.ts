import {
  EXPERIENCE_LEVELS,
  type ExperienceLevel,
  JOB_BRANCHES,
  JOB_TYPES,
  type JobBranch,
  type JobType,
  REMOTE_TYPES,
  type RemoteType,
} from "@baito/shared";
import { DEFAULT_MODEL, openai } from "../client";
import { parseStructuredOutput } from "../parsers/structured-output";

export interface JobClassificationResult {
  jobType: JobType | null;
  jobBranch: JobBranch | null;
  remoteType: RemoteType | null;
  experienceLevel: ExperienceLevel | null;
  keywords: string[];
  sdgs: number[];
}

const SYSTEM_PROMPT = `You are an expert at classifying job postings.

Extract the following information from the job posting:

1. jobType: One of: ${Object.values(JOB_TYPES).join(", ")} (or null if not determinable)
2. jobBranch: One of: ${Object.values(JOB_BRANCHES).join(", ")} (the primary industry/sector)
3. remoteType: One of: ${Object.values(REMOTE_TYPES).join(", ")} (or null if not mentioned)
4. experienceLevel: One of: ${Object.values(EXPERIENCE_LEVELS).join(", ")} (or null if not determinable)
5. keywords: Array of 3-5 relevant keywords for search
6. sdgs: Array of relevant UN SDG numbers (1-17) that this job relates to

Respond in JSON format.
`;

export async function classifyJob(input: {
  title: string;
  description: string;
  organizationName?: string;
}): Promise<JobClassificationResult> {
  const userPrompt = `
Job Title: ${input.title}
${input.organizationName ? `Organization: ${input.organizationName}` : ""}

Job Description:
${input.description.substring(0, 3000)}

Classify this job posting.
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
  return parseStructuredOutput<JobClassificationResult>(content, {
    jobType: null,
    jobBranch: null,
    remoteType: null,
    experienceLevel: null,
    keywords: [],
    sdgs: [],
  });
}
