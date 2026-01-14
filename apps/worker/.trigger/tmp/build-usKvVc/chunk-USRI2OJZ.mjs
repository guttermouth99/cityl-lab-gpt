import {
  processFeedBatch
} from "./chunk-6D4G5P5M.mjs";
import {
  chunk
} from "./chunk-OQADXJ3N.mjs";
import {
  schedules_exports
} from "./chunk-BNK46XDO.mjs";
import {
  __name,
  init_esm
} from "./chunk-CEVTQX7C.mjs";

// src/jobs/feeds/sync-stepstone.ts
init_esm();
var syncStepstone = schedules_exports.task({
  id: "sync-stepstone",
  // Run every hour
  cron: "0 * * * *",
  run: /* @__PURE__ */ __name(async () => {
    const feedUrl = process.env.STEPSTONE_FEED_URL;
    if (!feedUrl) {
      throw new Error("STEPSTONE_FEED_URL not configured");
    }
    console.log("Fetching Stepstone feed...");
    const response = await fetch(feedUrl);
    const feedData = await response.json();
    console.log(`Found ${feedData.length} jobs in feed`);
    const batches = chunk(feedData, 50);
    console.log(`Split into ${batches.length} batches`);
    const batchTasks = batches.map(
      (batch, index) => processFeedBatch.trigger({
        batchIndex: index,
        jobs: batch,
        source: "stepstone"
      })
    );
    await Promise.all(batchTasks);
    return {
      totalJobs: feedData.length,
      batches: batches.length
    };
  }, "run")
});

export {
  syncStepstone
};
//# sourceMappingURL=chunk-USRI2OJZ.mjs.map
