import {
  and,
  db,
  eq,
  jobs,
  sql
} from "./chunk-OQADXJ3N.mjs";
import {
  schedules_exports
} from "./chunk-BNK46XDO.mjs";
import {
  __name,
  init_esm
} from "./chunk-CEVTQX7C.mjs";

// src/jobs/maintenance/detect-duplicates.ts
init_esm();
var detectDuplicates = schedules_exports.task({
  id: "detect-duplicates",
  // Run weekly on Sundays at 2 AM
  cron: "0 2 * * 0",
  run: /* @__PURE__ */ __name(async () => {
    console.log("Starting duplicate detection");
    const duplicates = await db.select({
      contentHash: jobs.contentHash,
      count: sql`count(*)`
    }).from(jobs).where(eq(jobs.status, "active")).groupBy(jobs.contentHash).having(sql`count(*) > 1`);
    console.log(`Found ${duplicates.length} duplicate groups`);
    let archived = 0;
    for (const dup of duplicates) {
      const dupJobs = await db.select().from(jobs).where(
        and(eq(jobs.contentHash, dup.contentHash), eq(jobs.status, "active"))
      ).orderBy(jobs.createdAt);
      const [oldest, ...rest] = dupJobs;
      for (const job of rest) {
        await db.update(jobs).set({ status: "archived", updatedAt: /* @__PURE__ */ new Date() }).where(eq(jobs.id, job.id));
        archived++;
      }
    }
    console.log(`Archived ${archived} duplicate jobs`);
    return {
      duplicateGroups: duplicates.length,
      archived
    };
  }, "run")
});

export {
  detectDuplicates
};
//# sourceMappingURL=chunk-OHU5EUEE.mjs.map
