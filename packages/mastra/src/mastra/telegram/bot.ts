import type { Mastra } from "@mastra/core/mastra";
import { Bot, InlineKeyboard } from "grammy";

/**
 * Pending review data stored in memory
 * In production, you'd want to persist this to a database
 */
interface PendingReview {
  runId: string;
  companyName: string;
  chatId: number;
  messageId: number;
  messageText: string;
  createdAt: Date;
}

const pendingReviews = new Map<string, PendingReview>();

/**
 * Mastra instance reference for resuming workflows
 */
let mastraInstance: Mastra | null = null;

/**
 * Set the Mastra instance for workflow resumption
 */
export function setMastraInstance(mastra: Mastra): void {
  mastraInstance = mastra;
}

/**
 * Format the assessment data for Telegram message
 */
function formatAssessmentMessage(data: {
  companyName: string;
  deciderVerdict: string;
  deciderConfidence: string;
  deciderReasoning: string;
  unresolvedConcerns: string[];
}): string {
  const concerns =
    data.unresolvedConcerns.length > 0
      ? data.unresolvedConcerns.map((c) => `• ${c}`).join("\n")
      : "None specified";

  return `
🔍 <b>Human Review Required</b>

<b>Company:</b> ${escapeHtml(data.companyName)}

<b>AI Assessment:</b>
• Verdict: ${escapeHtml(data.deciderVerdict)}
• Confidence: ${escapeHtml(data.deciderConfidence)}

<b>Reasoning:</b>
${escapeHtml(data.deciderReasoning)}

<b>Unresolved Concerns:</b>
${escapeHtml(concerns)}

━━━━━━━━━━━━━━━━━━━━
Please review and make a decision:
`.trim();
}

/**
 * Escape HTML special characters for Telegram
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Create the inline keyboard for approval/rejection
 */
function createApprovalKeyboard(runId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Has Impact", `approve:${runId}`)
    .text("❌ No Impact", `reject:${runId}`)
    .row()
    .text("⏸️ Insufficient Info", `insufficient:${runId}`);
}

/**
 * Create and configure the Telegram bot for human-in-the-loop approvals
 */
export function createApprovalBot(token: string) {
  const bot = new Bot(token);

  // Handle /start command
  bot.command("start", async (ctx) => {
    await ctx.reply(
      "👋 Welcome to the Impact Assessment Approval Bot!\n\n" +
        "I'll send you assessments that need human review. " +
        "You can approve or reject them using the buttons provided.\n\n" +
        "Use /pending to see pending reviews."
    );
  });

  // Handle /pending command
  bot.command("pending", async (ctx) => {
    const pending = Array.from(pendingReviews.values());

    if (pending.length === 0) {
      await ctx.reply("No pending reviews at the moment.");
      return;
    }

    const list = pending
      .map(
        (r, i) => `${i + 1}. ${r.companyName} (${r.createdAt.toLocaleString()})`
      )
      .join("\n");

    await ctx.reply(`📋 <b>Pending Reviews:</b>\n\n${list}`, {
      parse_mode: "HTML",
    });
  });

  // Handle approval callback
  bot.callbackQuery(/^approve:(.+)$/, async (ctx) => {
    const runId = ctx.match[1];
    const review = pendingReviews.get(runId);

    if (!review) {
      await ctx.answerCallbackQuery({
        text: "This review has already been processed or expired.",
        show_alert: true,
      });
      return;
    }

    try {
      // Resume the workflow with approval
      await resumeWorkflow(runId, "Has Impact", ctx.from?.username);

      pendingReviews.delete(runId);

      await ctx.editMessageText(
        `${review.messageText}\n\n` +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          `✅ <b>APPROVED</b> by @${ctx.from?.username ?? "unknown"}\n` +
          "Decision: Has Impact",
        { parse_mode: "HTML" }
      );

      await ctx.answerCallbackQuery({ text: "Approved!" });
    } catch (error) {
      console.error("Failed to resume workflow:", error);
      await ctx.answerCallbackQuery({
        text: "Failed to process approval. Please try again.",
        show_alert: true,
      });
    }
  });

  // Handle rejection callback
  bot.callbackQuery(/^reject:(.+)$/, async (ctx) => {
    const runId = ctx.match[1];
    const review = pendingReviews.get(runId);

    if (!review) {
      await ctx.answerCallbackQuery({
        text: "This review has already been processed or expired.",
        show_alert: true,
      });
      return;
    }

    try {
      // Resume the workflow with rejection
      await resumeWorkflow(runId, "No Clear Impact", ctx.from?.username);

      pendingReviews.delete(runId);

      await ctx.editMessageText(
        `${review.messageText}\n\n` +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          `❌ <b>REJECTED</b> by @${ctx.from?.username ?? "unknown"}\n` +
          "Decision: No Clear Impact",
        { parse_mode: "HTML" }
      );

      await ctx.answerCallbackQuery({ text: "Rejected!" });
    } catch (error) {
      console.error("Failed to resume workflow:", error);
      await ctx.answerCallbackQuery({
        text: "Failed to process rejection. Please try again.",
        show_alert: true,
      });
    }
  });

  // Handle insufficient info callback
  bot.callbackQuery(/^insufficient:(.+)$/, async (ctx) => {
    const runId = ctx.match[1];
    const review = pendingReviews.get(runId);

    if (!review) {
      await ctx.answerCallbackQuery({
        text: "This review has already been processed or expired.",
        show_alert: true,
      });
      return;
    }

    try {
      // Resume the workflow with insufficient info
      await resumeWorkflow(
        runId,
        "Insufficient Information",
        ctx.from?.username
      );

      pendingReviews.delete(runId);

      await ctx.editMessageText(
        `${review.messageText}\n\n` +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          `⏸️ <b>INSUFFICIENT INFO</b> by @${ctx.from?.username ?? "unknown"}\n` +
          "Decision: Insufficient Information",
        { parse_mode: "HTML" }
      );

      await ctx.answerCallbackQuery({ text: "Marked as insufficient info!" });
    } catch (error) {
      console.error("Failed to resume workflow:", error);
      await ctx.answerCallbackQuery({
        text: "Failed to process. Please try again.",
        show_alert: true,
      });
    }
  });

  // Error handler
  bot.catch((err) => {
    console.error("Telegram bot error:", err);
  });

  return bot;
}

/**
 * Resume a workflow with the human's decision
 */
async function resumeWorkflow(
  runId: string,
  verdict: "Has Impact" | "No Clear Impact" | "Insufficient Information",
  reviewer?: string
) {
  if (!mastraInstance) {
    throw new Error("Mastra instance not set. Call setMastraInstance() first.");
  }

  const workflow = mastraInstance.getWorkflow("impactAssessmentWorkflow");
  const run = await workflow.createRun({ runId });

  await run.resume({
    step: "human-review",
    resumeData: {
      humanVerdict: verdict,
      humanNotes: `Reviewed via Telegram by @${reviewer ?? "unknown"}`,
    },
  });
}

/**
 * Send a review request to Telegram
 */
export async function sendReviewRequest(
  bot: Bot,
  chatId: number,
  runId: string,
  data: {
    companyName: string;
    deciderVerdict: string;
    deciderConfidence: string;
    deciderReasoning: string;
    unresolvedConcerns: string[];
  }
) {
  const message = formatAssessmentMessage(data);
  const keyboard = createApprovalKeyboard(runId);

  const sent = await bot.api.sendMessage(chatId, message, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });

  // Store the pending review with the message text for later editing
  pendingReviews.set(runId, {
    runId,
    companyName: data.companyName,
    chatId,
    messageId: sent.message_id,
    messageText: message,
    createdAt: new Date(),
  });

  return sent;
}

/**
 * Get pending reviews count
 */
export function getPendingReviewsCount(): number {
  return pendingReviews.size;
}

/**
 * Clear expired reviews (older than 24 hours)
 */
export function clearExpiredReviews(): number {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  let cleared = 0;

  for (const [runId, review] of pendingReviews) {
    if (now - review.createdAt.getTime() > twentyFourHours) {
      pendingReviews.delete(runId);
      cleared++;
    }
  }

  return cleared;
}
