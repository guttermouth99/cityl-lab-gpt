import {
  computeContentHashSync,
  createJob,
  createOrganization,
  findDuplicateJob,
  findOrMatchOrganization
} from "./chunk-OQADXJ3N.mjs";
import {
  task
} from "./chunk-BNK46XDO.mjs";
import {
  __name,
  init_esm
} from "./chunk-CEVTQX7C.mjs";

// src/jobs/feeds/process-feed-batch.ts
init_esm();
var processFeedBatch = task({
  id: "process-feed-batch",
  retry: {
    maxAttempts: 3
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { batchIndex, jobs, source } = payload;
    console.log(`Processing batch ${batchIndex} with ${jobs.length} jobs`);
    let created = 0;
    let skipped = 0;
    let errors = 0;
    for (const feedJob of jobs) {
      try {
        let org = await findOrMatchOrganization({
          name: feedJob.organizationName,
          url: feedJob.url
        });
        if (!org) {
          org = await createOrganization({
            name: feedJob.organizationName,
            url: feedJob.url
          });
        }
        const contentHash = computeContentHashSync(
          `${feedJob.title}|${feedJob.description}|${org.id}`
        );
        const duplicate = await findDuplicateJob(contentHash, org.id);
        if (duplicate) {
          skipped++;
          continue;
        }
        await createJob({
          organizationId: org.id,
          title: feedJob.title,
          description: feedJob.description,
          externalId: feedJob.externalId,
          source,
          sourceFeed: source
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
      errors
    };
  }, "run")
});

export {
  processFeedBatch
};
//# sourceMappingURL=chunk-6D4G5P5M.mjs.map
