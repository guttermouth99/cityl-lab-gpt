import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { Observability } from "@mastra/observability";

import { deciderAgent } from "./agents/decider-agent";
import { devilsAdvocateAgent } from "./agents/devils-advocate-agent";
import { researchAgent } from "./agents/research-agent";
import { initTelegramBot } from "./telegram";
import { impactAssessmentWorkflow } from "./workflows/impact-assessment-workflow";

// Re-export telegram module for external use
export * from "./telegram";

// Use MASTRA_DB_URL env var or default to relative path
// For shared traces across dev server and worker, set MASTRA_DB_URL to an absolute path
const dbUrl =
  "file:/Users/lukas/Projects/baito3000/baito-turbo/packages/mastra/mastra.db";
console.log(dbUrl, "dbUrl");
export const mastra = new Mastra({
  agents: { researchAgent, devilsAdvocateAgent, deciderAgent },
  workflows: { impactAssessmentWorkflow },
  storage: new LibSQLStore({
    id: "mastra",
    url: dbUrl,
  }),
  observability: new Observability({
    default: { enabled: true },
  }),
});

// Auto-initialize Telegram bot if environment variables are present
// This ensures the bot is ready when workflows need to send notifications
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

if (telegramToken && telegramChatId) {
  const numericChatId = Number.parseInt(telegramChatId, 10);
  if (Number.isNaN(numericChatId)) {
    console.warn(
      `[Mastra] TELEGRAM_CHAT_ID is not a valid number: "${telegramChatId}"`
    );
  } else {
    console.log(
      `[Mastra] Initializing Telegram bot for human-in-the-loop notifications (chat ID: ${numericChatId})`
    );
    initTelegramBot(telegramToken, numericChatId, mastra);
  }
} else {
  console.log(
    "[Mastra] Telegram bot not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to enable Telegram notifications."
  );
}
