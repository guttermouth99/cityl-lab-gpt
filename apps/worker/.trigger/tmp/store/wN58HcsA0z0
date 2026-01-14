import {
  sendBatchTask
} from "./chunk-GWR6GPKO.mjs";
import {
  chunk,
  getUserAlerts,
  getUsersForDailyAlerts
} from "./chunk-OQADXJ3N.mjs";
import {
  schedules_exports
} from "./chunk-BNK46XDO.mjs";
import {
  __name,
  init_esm
} from "./chunk-CEVTQX7C.mjs";

// src/jobs/newsletter/daily-dispatch.ts
init_esm();
var dailyDispatch = schedules_exports.task({
  id: "daily-dispatch",
  // Run at 6 AM UTC every day
  cron: "0 6 * * *",
  run: /* @__PURE__ */ __name(async () => {
    console.log("Starting daily newsletter dispatch");
    const users = await getUsersForDailyAlerts();
    console.log(`Found ${users.length} users for daily alerts`);
    if (users.length === 0) {
      return { usersProcessed: 0, batches: 0 };
    }
    const usersWithAlerts = await Promise.all(
      users.map(async (user) => {
        const alerts = await getUserAlerts(user.id);
        return {
          userId: user.id,
          email: user.email,
          name: user.name,
          alerts: alerts.filter((a) => a.isActive)
        };
      })
    );
    const eligibleUsers = usersWithAlerts.filter((u) => u.alerts.length > 0);
    console.log(`${eligibleUsers.length} users have active alerts`);
    const batches = chunk(eligibleUsers, 100);
    console.log(`Split into ${batches.length} batches`);
    const batchTasks = batches.map(
      (batch, index) => sendBatchTask.trigger({
        batchIndex: index,
        users: batch,
        type: "daily"
      })
    );
    await Promise.all(batchTasks);
    return {
      usersProcessed: eligibleUsers.length,
      batches: batches.length
    };
  }, "run")
});

export {
  dailyDispatch
};
//# sourceMappingURL=chunk-FE7FXLSV.mjs.map
