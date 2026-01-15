import {
  getActiveJobs,
  hasJobBeenSentToUser,
  markJobAsSent,
} from "@baito/db/queries";
import type { AlertFilters } from "@baito/db/schema";
import { sendJobAlertEmail, sendWeeklyDigestEmail } from "@baito/email";
import { task } from "@trigger.dev/sdk";

interface UserWithAlerts {
  userId: string;
  email: string;
  name: string;
  alerts: Array<{
    id: string;
    name: string;
    filters: AlertFilters;
  }>;
}

interface JobToSend {
  id: string;
  title: string;
  slug: string;
  organizationName: string;
  location?: string;
  jobType?: string;
}

async function collectJobsForAlert(
  userId: string,
  alert: UserWithAlerts["alerts"][number]
): Promise<JobToSend[]> {
  const matchingJobs = await getActiveJobs({
    ...alert.filters,
    limit: 10,
  });

  const jobs: JobToSend[] = [];
  for (const job of matchingJobs) {
    const alreadySent = await hasJobBeenSentToUser(userId, job.id);
    if (!alreadySent) {
      jobs.push({
        id: job.id,
        title: job.title,
        slug: job.slug,
        organizationName: job.organization?.name || "Unknown",
        location: job.locations?.[0]?.city ?? undefined,
        jobType: job.jobType ?? undefined,
      });
    }
  }
  return jobs;
}

async function collectJobsForUser(user: UserWithAlerts): Promise<JobToSend[]> {
  const allJobs: JobToSend[] = [];
  for (const alert of user.alerts) {
    const jobs = await collectJobsForAlert(user.userId, alert);
    allJobs.push(...jobs);
  }
  return allJobs;
}

async function sendEmail(
  user: UserWithAlerts,
  jobs: JobToSend[],
  type: "daily" | "weekly"
): Promise<void> {
  if (type === "daily") {
    const alertName =
      user.alerts.length === 1
        ? (user.alerts[0]?.name ?? "Your Alerts")
        : "Your Alerts";
    await sendJobAlertEmail(user.email, {
      userName: user.name,
      alertName,
      jobs: jobs.slice(0, 10),
    });
  } else {
    await sendWeeklyDigestEmail(user.email, {
      userName: user.name,
      totalNewJobs: jobs.length,
      topJobs: jobs.slice(0, 5),
      topCategories: [],
    });
  }
}

async function markJobsAsSent(
  userId: string,
  jobs: JobToSend[]
): Promise<void> {
  for (const job of jobs) {
    await markJobAsSent(userId, job.id);
  }
}

async function processUser(
  user: UserWithAlerts,
  type: "daily" | "weekly"
): Promise<"sent" | "skipped"> {
  const jobsToSend = await collectJobsForUser(user);
  if (jobsToSend.length === 0) {
    return "skipped";
  }
  await sendEmail(user, jobsToSend, type);
  await markJobsAsSent(user.userId, jobsToSend);
  return "sent";
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
        const result = await processUser(user, type);
        if (result === "sent") {
          sent++;
        } else {
          skipped++;
        }
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
