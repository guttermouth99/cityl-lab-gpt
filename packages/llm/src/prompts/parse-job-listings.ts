import { generateText, Output } from "ai";
import { z } from "zod";

const DEFAULT_MODEL = "google/gemini-2.5-flash";

export const JobListingSchema = z.object({
  jobTitle: z.string().describe("The title of the job listing"),
  jobUrl: z.string().describe("The URL of the job listing"),
  jobDate: z
    .string()
    .nullable()
    .describe("The date associated with the job listing"),
});

export const JobListingsSchema = z.object({
  jobListings: z.array(JobListingSchema),
});

export type JobListing = z.infer<typeof JobListingSchema>;
export type JobListingsResult = z.infer<typeof JobListingsSchema>;

function buildParseJobListingsPrompt(content: string): string {
  return `You are looking at a career/jobs page. Find ALL job postings/listings on this page.

WHAT TO LOOK FOR:
- Job listings typically appear as repeating sections, cards, rows, or list items
- Each listing usually contains: a job title (most prominent text) and often a date or location
- Job titles are often the largest or most prominent text in each listing
- Dates might indicate posting date, deadline, or start date

FOR EACH JOB LISTING EXTRACT:
1. jobTitle: The main heading/title of the position (required)
   - Usually the most prominent text in the listing
   - Look for role names, position titles, job names
   - Examples: "Software Engineer", "Teacher (m/w/d) Physics", "Marketing Manager"

2. jobUrl: The URL/link to the job details page (required)
   - Look for links on the job title or "Apply" / "View" buttons
   - Should be an absolute URL or a relative path that can be resolved

3. jobDate: Any date associated with the job (optional)
   - Posting date, application deadline, start date, etc.
   - Examples: "Posted: 2024-01-15", "Einstellung zum 01.08.2026", "Deadline: March 1st"
   - If multiple dates exist, prefer start date > deadline > posting date
   - Return null if no date is visible

IMPORTANT:
- Extract ALL jobs visible on the page, don't miss any
- Look for visual patterns - jobs often have consistent formatting/structure
- Don't include navigation items, headers, or footer links as jobs

RETURN FORMAT:
Return an array of job objects, one for each distinct job posting found.

The page content is:
${content}`;
}

/**
 * Parse job listings from page content using AI
 */
export async function parseJobListingsFromContent(
  content: string,
  options?: { model?: string }
): Promise<JobListing[]> {
  const { output } = await generateText({
    model: options?.model ?? DEFAULT_MODEL,
    prompt: buildParseJobListingsPrompt(content),
    temperature: 0.1,
    output: Output.object({
      schema: JobListingsSchema,
      name: "JobListings",
      description: "List of job postings extracted from a career page",
    }),
  });

  return output.jobListings;
}
