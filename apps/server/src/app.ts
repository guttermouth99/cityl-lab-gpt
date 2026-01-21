import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * AI Gateway - Proxy endpoint for LLM providers
 *
 * This endpoint can be used to:
 * - Route requests to different LLM providers (OpenAI, Anthropic, etc.)
 * - Add logging and analytics
 * - Implement rate limiting
 * - Add caching for repeated requests
 * - Handle API key management
 *
 * Example usage:
 * POST /v1/chat/completions
 * {
 *   "model": "gpt-4o-mini",
 *   "messages": [{ "role": "user", "content": "Hello!" }]
 * }
 */
app.post("/v1/chat/completions", async (req, res) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return res.status(500).json({
      error: {
        message: "OPENAI_API_KEY not configured",
        type: "configuration_error",
      },
    });
  }

  try {
    // Forward request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Log request for analytics (optional)
    console.log(
      `[AI Gateway] ${req.body.model} - ${req.body.messages?.length || 0} messages`
    );

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("[AI Gateway] Error:", error);
    return res.status(500).json({
      error: {
        message: "Failed to proxy request to LLM provider",
        type: "proxy_error",
      },
    });
  }
});

export { app };
