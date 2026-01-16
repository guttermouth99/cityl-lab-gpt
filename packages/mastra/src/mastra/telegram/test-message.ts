/**
 * Test script to verify Telegram bot can send messages
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=your_token TELEGRAM_CHAT_ID=your_chat_id bun run src/mastra/telegram/test-message.ts
 */

import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error("Error: TELEGRAM_BOT_TOKEN environment variable is required");
  process.exit(1);
}

if (!chatId) {
  console.error("Error: TELEGRAM_CHAT_ID environment variable is required");
  process.exit(1);
}

const numericChatId = Number.parseInt(chatId, 10);

if (Number.isNaN(numericChatId)) {
  console.error("Error: TELEGRAM_CHAT_ID must be a valid number");
  process.exit(1);
}

async function sendTestMessage() {
  // Token is guaranteed to be defined due to the check above
  const bot = new Bot(token as string);

  console.log(`Sending test message to chat ID: ${numericChatId}...`);

  try {
    const message = await bot.api.sendMessage(
      numericChatId,
      "🧪 <b>Test Message</b>\n\n" +
        "This is a test message from the Impact Assessment Approval Bot.\n\n" +
        "If you see this, the bot is configured correctly!\n\n" +
        `<i>Sent at: ${new Date().toLocaleString()}</i>`,
      { parse_mode: "HTML" }
    );

    console.log("✅ Message sent successfully!");
    console.log(`   Message ID: ${message.message_id}`);
    console.log(`   Chat ID: ${message.chat.id}`);
    console.log(`   Chat type: ${message.chat.type}`);

    if (message.chat.type === "group" || message.chat.type === "supergroup") {
      console.log(
        `   Group title: ${(message.chat as { title?: string }).title}`
      );
    }
  } catch (error) {
    console.error("❌ Failed to send message:");
    console.error(error);

    if (error instanceof Error && error.message.includes("chat not found")) {
      console.error("\nTip: Make sure the bot is added to the group chat.");
    }
    if (error instanceof Error && error.message.includes("bot was blocked")) {
      console.error(
        "\nTip: The bot was blocked by the user. Unblock it to receive messages."
      );
    }

    process.exit(1);
  }
}

sendTestMessage();
