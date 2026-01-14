import { getUserAlerts, getUsersForDailyAlerts } from "@baito/db/queries";
import { chunk } from "@baito/shared";
import { schedules } from "@trigger.dev/sdk";
import { sendBatchTask } from "./send-batch";

export const dailyDispatch = schedules.task({
  id: "daily-dispatch",
  // Run at 6 AM UTC every day
  cron: "0 6 * * *",
  run: async () => {
    console.log("Starting daily newsletter dispatch");

    // Get all users with daily alerts enabled
    const users = await getUsersForDailyAlerts();
    console.log(`Found ${users.length} users for daily alerts`);

    if (users.length === 0) {
      return { usersProcessed: 0, batches: 0 };
    }

    // Get alerts for each user
    const usersWithAlerts = await Promise.all(
      users.map(async (user) => {
        const alerts = await getUserAlerts(user.id);
        return {
          userId: user.id,
          email: user.email,
          name: user.name,
          alerts: alerts.filter((a) => a.isActive),
        };
      })
    );

    // Filter users who have active alerts
    const eligibleUsers = usersWithAlerts.filter((u) => u.alerts.length > 0);
    console.log(`${eligibleUsers.length} users have active alerts`);

    // Chunk into batches of 100 for sending
    const batches = chunk(eligibleUsers, 100);
    console.log(`Split into ${batches.length} batches`);

    // Spawn batch sending tasks
    const batchTasks = batches.map((batch, index) =>
      sendBatchTask.trigger({
        batchIndex: index,
        users: batch,
        type: "daily",
      })
    );

    await Promise.all(batchTasks);

    return {
      usersProcessed: eligibleUsers.length,
      batches: batches.length,
    };
  },
});
