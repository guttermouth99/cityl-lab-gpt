import { schedules_exports } from "./chunk-BNK46XDO.mjs";
import { __name, init_esm } from "./chunk-CEVTQX7C.mjs";
import { expireOldJobs, getExpiredJobsCount } from "./chunk-OQADXJ3N.mjs";

// src/jobs/maintenance/expire-jobs.ts
init_esm();
var expireJobsTask = schedules_exports.task({
  id: "expire-jobs",
  // Run every day at midnight
  cron: "0 0 * * *",
  run: /* @__PURE__ */ __name(async () => {
    console.log("Starting job expiration check");
    const expiredCount = await getExpiredJobsCount();
    console.log(`Found ${expiredCount} jobs to expire`);
    if (expiredCount === 0) {
      return { expired: 0 };
    }
    await expireOldJobs(/* @__PURE__ */ new Date());
    console.log(`Expired ${expiredCount} jobs`);
    return {
      expired: expiredCount,
    };
  }, "run"),
});

export { expireJobsTask };
//# sourceMappingURL=chunk-6DZ3YKXK.mjs.map
