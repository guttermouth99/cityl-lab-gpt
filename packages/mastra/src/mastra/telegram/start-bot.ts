/**
 * Standalone script to start the Telegram approval bot
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=your_token TELEGRAM_CHAT_ID=your_chat_id bun run src/mastra/telegram/start-bot.ts
 *
 * Environment variables:
 *   - TELEGRAM_BOT_TOKEN: Your Telegram bot token from @BotFather
 *   - TELEGRAM_CHAT_ID: The chat ID where approval requests will be sent
 *     (can be a user ID for direct messages or a group chat ID)
 *
 * To get your chat ID:
 *   1. Start a chat with your bot
 *   2. Send /start
 *   3. Visit: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
 *   4. Look for "chat":{"id": YOUR_CHAT_ID}
 */

import { mastra } from "../index";
import { initTelegramBot, startBot } from "./index";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error("Error: TELEGRAM_BOT_TOKEN environment variable is required");
  console.error(
    "Get your bot token from @BotFather on Telegram: https://t.me/BotFather"
  );
  process.exit(1);
}

if (!chatId) {
  console.error("Error: TELEGRAM_CHAT_ID environment variable is required");
  console.error("This is the chat ID where approval requests will be sent.");
  console.error("To find your chat ID:");
  console.error("  1. Start a chat with your bot");
  console.error("  2. Send /start");
  console.error(`  3. Visit: https://api.telegram.org/bot${token}/getUpdates`);
  console.error('  4. Look for "chat":{"id": YOUR_CHAT_ID}');
  process.exit(1);
}

const numericChatId = Number.parseInt(chatId, 10);

if (Number.isNaN(numericChatId)) {
  console.error("Error: TELEGRAM_CHAT_ID must be a valid number");
  process.exit(1);
}

// Initialize the bot
console.log("Initializing Telegram approval bot...");
initTelegramBot(token, numericChatId, mastra);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT, shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM, shutting down...");
  process.exit(0);
});

// Start the bot
console.log("Starting bot...");
console.log(`Approval requests will be sent to chat ID: ${numericChatId}`);
console.log("Press Ctrl+C to stop\n");

startBot().catch((error) => {
  console.error("Failed to start bot:", error);
  process.exit(1);
});
