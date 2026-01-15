import {
  createJob,
  createOrganization,
  findDuplicateJob,
  findOrMatchOrganization,
} from "@baito/db/queries";
import { computeContentHashSync, type JobSource } from "@baito/shared";
import { task } from "@trigger.dev/sdk";

interface FeedJob {
  externalId: string;
  title: string;
  description: string;
  organizationName: string;
  url: string;
  location?: string;
}

export const processFeedBatch = task({
  id: "process-feed-batch",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: {
    batchIndex: number;
    jobs: FeedJob[];
    source: string;
  }) => {
    const { batchIndex, jobs, source } = payload;
    console.log(`Processing batch ${batchIndex} with ${jobs.length} jobs`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const feedJob of jobs) {
      try {
        // Find or create organization
        let org = await findOrMatchOrganization({
          name: feedJob.organizationName,
          url: feedJob.url,
        });

        if (!org) {
          org = await createOrganization({
            name: feedJob.organizationName,
            url: feedJob.url,
          });
        }

        if (!org) {
          console.error(
            `Failed to create organization for job ${feedJob.externalId}`
          );
          errors++;
          continue;
        }

        // Check for duplicates
        const contentHash = computeContentHashSync(
          `${feedJob.title}|${feedJob.description}|${org.id}`
        );

        const duplicate = await findDuplicateJob(contentHash, org.id);
        if (duplicate) {
          skipped++;
          continue;
        }

        // Create the job
        await createJob({
          organizationId: org.id,
          title: feedJob.title,
          description: feedJob.description,
          externalId: feedJob.externalId,
          source: source as JobSource,
          sourceFeed: source,
        });

        created++;
      } catch (error) {
        console.error(`Error processing job ${feedJob.externalId}:`, error);
        errors++;
      }
    }

    return {
      batchIndex,
      processed: jobs.length,
      created,
      skipped,
      errors,
    };
  },
});
