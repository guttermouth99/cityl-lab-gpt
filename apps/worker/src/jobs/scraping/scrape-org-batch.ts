import { updateOrganization } from "@baito/db/queries";
import { computeContentHashSync } from "@baito/shared";
import { task } from "@trigger.dev/sdk";

interface OrgToScrape {
  id: string;
  careerPageUrl: string;
  contentHash: string | null;
}

export const scrapeOrgBatch = task({
  id: "scrape-org-batch",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: { organizations: OrgToScrape[] }) => {
    const { organizations } = payload;
    console.log(`Scraping ${organizations.length} organization career pages`);

    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEY not configured");
    }

    let updated = 0;
    let unchanged = 0;
    let errors = 0;

    for (const org of organizations) {
      try {
        // Use Jina Reader to fetch the page content
        const response = await fetch(`https://r.jina.ai/${org.careerPageUrl}`, {
          headers: {
            Authorization: `Bearer ${jinaApiKey}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Failed to scrape ${org.careerPageUrl}: ${response.status}`
          );
          errors++;
          continue;
        }

        const content = await response.text();
        const newContentHash = computeContentHashSync(content);

        // Check if content has changed
        if (newContentHash === org.contentHash) {
          unchanged++;
          continue;
        }

        // Update the organization with new content hash
        await updateOrganization(org.id, {
          contentHash: newContentHash,
        });

        updated++;

        // TODO: Parse content and extract jobs
        // This would trigger job extraction tasks
      } catch (error) {
        console.error(`Error scraping org ${org.id}:`, error);
        errors++;
      }
    }

    return {
      total: organizations.length,
      updated,
      unchanged,
      errors,
    };
  },
});
