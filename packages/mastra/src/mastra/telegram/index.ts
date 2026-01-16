import type { Mastra } from "@mastra/core/mastra";
import type { Bot } from "grammy";

import {
  clearExpiredReviews,
  createApprovalBot,
  getPendingReviewsCount,
  sendReviewRequest,
  setMastraInstance,
} from "./bot";

export {
  clearExpiredReviews,
  createApprovalBot,
  getPendingReviewsCount,
  sendReviewRequest,
  setMastraInstance,
};

// Export workflow integration helpers
export {
  checkAndNotifySuspendedRun,
  runImpactAssessmentWithTelegram,
} from "./workflow-integration";

/**
 * Singleton bot instance and configuration
 */
let botInstance: Bot | null = null;
let approvalChatId: number | null = null;

/**
 * Initialize the Telegram bot with token, approval chat ID, and mastra instance
 */
export function initTelegramBot(
  token: string,
  chatId: number,
  mastra: Mastra
): Bot {
  if (botInstance) {
    console.warn(
      "Telegram bot already initialized, returning existing instance"
    );
    return botInstance;
  }

  // Set the mastra instance for workflow resumption
  setMastraInstance(mastra);

  botInstance = createApprovalBot(token);
  approvalChatId = chatId;

  console.log("[Telegram Bot] Initialized with chat ID:", chatId);

  return botInstance;
}

/**
 * Get the bot instance (throws if not initialized)
 */
export function getBot(): Bot {
  if (!botInstance) {
    throw new Error(
      "Telegram bot not initialized. Call initTelegramBot() first."
    );
  }
  return botInstance;
}

/**
 * Get the approval chat ID (throws if not initialized)
 */
export function getApprovalChatId(): number {
  if (!approvalChatId) {
    throw new Error(
      "Telegram bot not initialized. Call initTelegramBot() first."
    );
  }
  return approvalChatId;
}

/**
 * Check if the bot is initialized
 */
export function isBotInitialized(): boolean {
  return botInstance !== null && approvalChatId !== null;
}

/**
 * Send a human review request to the configured Telegram chat
 * This is the main function to call when a workflow needs human review
 */
export async function notifyHumanReview(
  runId: string,
  data: {
    companyName: string;
    deciderVerdict: string;
    deciderConfidence: string;
    deciderReasoning: string;
    unresolvedConcerns: string[];
  }
) {
  if (!isBotInitialized()) {
    console.error(
      `[Telegram] ERROR: Bot not initialized! Cannot send notification for "${data.companyName}". ` +
        "Make sure to call initTelegramBot(token, chatId, mastra) before running workflows that require human review."
    );
    return null;
  }

  const bot = getBot();
  const chatId = getApprovalChatId();

  console.log(
    `[Telegram] Sending review request to chat ${chatId} for runId: ${runId}`
  );

  try {
    const result = await sendReviewRequest(bot, chatId, runId, data);
    console.log(
      `[Telegram] Review request sent successfully for "${data.companyName}"`
    );
    return result;
  } catch (error) {
    console.error(
      `[Telegram] ERROR: Failed to send review request for "${data.companyName}":`,
      error
    );
    throw error;
  }
}

/**
 * Start the bot (long polling mode)
 */
export async function startBot(): Promise<void> {
  const bot = getBot();

  // Set up periodic cleanup of expired reviews
  setInterval(
    () => {
      const cleared = clearExpiredReviews();
      if (cleared > 0) {
        console.log(`[Telegram Bot] Cleared ${cleared} expired reviews`);
      }
    },
    60 * 60 * 1000
  ); // Every hour

  console.log("[Telegram Bot] Starting long polling...");
  await bot.start();
}

/**
 * Stop the bot gracefully
 */
export async function stopBot(): Promise<void> {
  if (botInstance) {
    console.log("[Telegram Bot] Stopping...");
    await botInstance.stop();
    botInstance = null;
    approvalChatId = null;
  }
}
