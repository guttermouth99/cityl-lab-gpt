import { and, db, eq, sql } from "@baito/db";
import { jobs } from "@baito/db/schema";
import { schedules } from "@trigger.dev/sdk";

export const detectDuplicates = schedules.task({
  id: "detect-duplicates",
  // Run weekly on Sundays at 2 AM
  cron: "0 2 * * 0",
  run: async () => {
    console.log("Starting duplicate detection");

    // Find jobs with duplicate content hashes
    const duplicates = await db
      .select({
        contentHash: jobs.contentHash,
        count: sql<number>`count(*)`,
      })
      .from(jobs)
      .where(eq(jobs.status, "active"))
      .groupBy(jobs.contentHash)
      .having(sql`count(*) > 1`);

    console.log(`Found ${duplicates.length} duplicate groups`);

    let archived = 0;

    for (const dup of duplicates) {
      // Get all jobs with this content hash
      const dupJobs = await db
        .select()
        .from(jobs)
        .where(
          and(eq(jobs.contentHash, dup.contentHash), eq(jobs.status, "active"))
        )
        .orderBy(jobs.createdAt);

      // Keep the oldest, archive the rest
      const [_oldest, ...rest] = dupJobs;

      for (const job of rest) {
        await db
          .update(jobs)
          .set({ status: "archived", updatedAt: new Date() })
          .where(eq(jobs.id, job.id));
        archived++;
      }
    }

    console.log(`Archived ${archived} duplicate jobs`);

    return {
      duplicateGroups: duplicates.length,
      archived,
    };
  },
});
