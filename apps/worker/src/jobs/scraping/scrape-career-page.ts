import {
  fetchPageContent,
  type JobListing,
  parseJobListingsFromContent,
} from "@baito/llm";
import { task } from "@trigger.dev/sdk";

interface ScrapeCareerPagePayload {
  careerPageUrl: string;
}

interface ScrapeCareerPageResult {
  jobs: JobListing[];
  url: string;
  scrapedAt: string;
}

export const scrapeCareerPageTask = task({
  id: "scrape-career-page",
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 10_000,
    factor: 2,
  },
  run: async (
    payload: ScrapeCareerPagePayload
  ): Promise<ScrapeCareerPageResult> => {
    const { careerPageUrl } = payload;

    console.log(`Scraping career page: ${careerPageUrl}`);

    // Fetch page content using Jina Reader
    const content = await fetchPageContent(careerPageUrl);
    console.log(`Fetched ${content.length} characters of content`);

    // Parse job listings using AI
    const jobListings = await parseJobListingsFromContent(content);
    console.log(`Found ${jobListings.length} job listings`);

    return {
      jobs: jobListings,
      url: careerPageUrl,
      scrapedAt: new Date().toISOString(),
    };
  },
});
