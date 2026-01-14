import {
  getActiveJobs,
  hasJobBeenSentToUser,
  markJobAsSent,
} from "@baito/db/queries";
import { sendJobAlertEmail, sendWeeklyDigestEmail } from "@baito/email";
import { task } from "@trigger.dev/sdk";

interface UserWithAlerts {
  userId: string;
  email: string;
  name: string;
  alerts: Array<{
    id: string;
    name: string;
    filters: Record<string, any>;
  }>;
}

export const sendBatchTask = task({
  id: "send-batch",
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: {
    batchIndex: number;
    users: UserWithAlerts[];
    type: "daily" | "weekly";
  }) => {
    const { batchIndex, users, type } = payload;
    console.log(
      `Processing batch ${batchIndex} with ${users.length} users (${type})`
    );

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Collect jobs for all user alerts
        const jobsToSend: Array<{
          id: string;
          title: string;
          slug: string;
          organizationName: string;
          location?: string;
          jobType?: string;
        }> = [];

        for (const alert of user.alerts) {
          // Get matching jobs based on alert filters
          const matchingJobs = await getActiveJobs({
            ...alert.filters,
            limit: 10,
          });

          for (const job of matchingJobs) {
            // Check if job was already sent to this user
            const alreadySent = await hasJobBeenSentToUser(user.userId, job.id);
            if (alreadySent) continue;

            jobsToSend.push({
              id: job.id,
              title: job.title,
              slug: job.slug,
              organizationName: job.organization?.name || "Unknown",
              location: job.locations?.[0]?.city,
              jobType: job.jobType || undefined,
            });
          }
        }

        // Skip if no new jobs
        if (jobsToSend.length === 0) {
          skipped++;
          continue;
        }

        // Send email
        if (type === "daily") {
          await sendJobAlertEmail(user.email, {
            userName: user.name,
            alertName:
              user.alerts.length === 1 ? user.alerts[0]!.name : "Your Alerts",
            jobs: jobsToSend.slice(0, 10), // Limit to 10 jobs
          });
        } else {
          await sendWeeklyDigestEmail(user.email, {
            userName: user.name,
            totalNewJobs: jobsToSend.length,
            topJobs: jobsToSend.slice(0, 5),
            topCategories: [], // TODO: Calculate top categories
          });
        }

        // Mark jobs as sent
        for (const job of jobsToSend) {
          await markJobAsSent(user.userId, job.id);
        }

        sent++;
      } catch (error) {
        console.error(`Error sending to ${user.email}:`, error);
        errors++;
      }
    }

    return {
      batchIndex,
      type,
      total: users.length,
      sent,
      skipped,
      errors,
    };
  },
});
