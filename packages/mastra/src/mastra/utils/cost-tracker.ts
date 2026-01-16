import { z } from "zod";

/**
 * Cost tracking utilities for Mastra workflows
 *
 * Tracks token usage and calculates costs for:
 * - LLM calls (OpenAI, etc.)
 * - Tool calls (Jina Reader, Jina Search, etc.)
 */

// Pricing per 1 million tokens (as of January 2026)
const MODEL_PRICING: Record<
  string,
  { input: number; output: number; cachedInput?: number }
> = {
  "openai/gpt-4o": { input: 2.5, output: 10.0, cachedInput: 1.25 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.6, cachedInput: 0.075 },
  "openai/gpt-4-turbo": { input: 10.0, output: 30.0 },
  "openai/gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  // Anthropic models
  "anthropic/claude-3-5-sonnet": { input: 3.0, output: 15.0 },
  "anthropic/claude-3-opus": { input: 15.0, output: 75.0 },
  "anthropic/claude-3-haiku": { input: 0.25, output: 1.25 },
};

// Tool pricing per 1 million tokens
const TOOL_PRICING: Record<string, number> = {
  "jina-reader": 0.02, // $0.02 per 1M tokens
  "jina-search": 0.02, // $0.02 per 1M tokens
};

// Map function/variable names to tool IDs (Mastra returns function names, not tool IDs)
const TOOL_NAME_TO_ID: Record<string, string> = {
  jinaReaderTool: "jina-reader",
  jinaSearchTool: "jina-search",
};

/**
 * Normalize tool name to tool ID
 * Mastra returns function names (e.g., "jinaSearchTool") but we need tool IDs (e.g., "jina-search")
 */
export function normalizeToolId(toolName: string): string {
  return TOOL_NAME_TO_ID[toolName] ?? toolName;
}

/**
 * Token usage from an LLM call
 */
export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  reasoningTokens?: number;
  totalTokens: number;
}

/**
 * Token usage from a tool call
 */
export interface ToolUsage {
  toolId: string;
  tokens: number;
}

/**
 * Aggregated usage entry for a single operation
 */
export interface UsageEntry {
  type: "llm" | "tool";
  id: string; // model name or tool id
  usage: LLMUsage | ToolUsage;
}

/**
 * Individual LLM call entry with step identifier
 */
export interface LLMCallEntry {
  stepId: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  inputCost: number;
  outputCost: number;
  cachedInputCost: number;
  totalCost: number;
}

/**
 * Cost breakdown for LLM usage
 */
export interface LLMCostBreakdown {
  model: string;
  calls: LLMCallEntry[]; // Per-call tracking with step identifiers
  // Aggregated totals
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  inputCost: number;
  outputCost: number;
  cachedInputCost: number;
  totalCost: number;
}

/**
 * Cost breakdown for tool usage
 */
export interface ToolCostBreakdown {
  toolId: string;
  calls: number;
  tokens: number;
  cost: number;
}

/**
 * Complete cost breakdown for a workflow run
 */
export interface WorkflowCostBreakdown {
  llm: LLMCostBreakdown;
  tools: Record<string, ToolCostBreakdown>;
  totalCost: number;
}

/**
 * Zod schema for individual LLM call entry
 */
const llmCallEntrySchema = z.object({
  stepId: z.string().describe("The workflow step identifier"),
  inputTokens: z.number().describe("Input tokens for this call"),
  outputTokens: z.number().describe("Output tokens for this call"),
  cachedInputTokens: z.number().describe("Cached input tokens for this call"),
  inputCost: z.number().describe("Cost for input tokens in USD"),
  outputCost: z.number().describe("Cost for output tokens in USD"),
  cachedInputCost: z.number().describe("Cost for cached input tokens in USD"),
  totalCost: z.number().describe("Total cost for this call in USD"),
});

/**
 * Zod schema for workflow cost breakdown (for use in workflow schemas)
 */
export const workflowCostBreakdownSchema = z.object({
  llm: z.object({
    model: z.string().describe("The LLM model used"),
    calls: z
      .array(llmCallEntrySchema)
      .describe("Individual LLM calls with per-step costs"),
    inputTokens: z.number().describe("Total input tokens across all LLM calls"),
    outputTokens: z
      .number()
      .describe("Total output tokens across all LLM calls"),
    cachedInputTokens: z
      .number()
      .describe("Total cached input tokens across all LLM calls"),
    inputCost: z.number().describe("Cost for input tokens in USD"),
    outputCost: z.number().describe("Cost for output tokens in USD"),
    cachedInputCost: z.number().describe("Cost for cached input tokens in USD"),
    totalCost: z.number().describe("Total LLM cost in USD"),
  }),
  tools: z
    .record(
      z.string(),
      z.object({
        toolId: z.string().describe("The tool identifier"),
        calls: z.number().describe("Number of times this tool was called"),
        tokens: z.number().describe("Total tokens used by this tool"),
        cost: z.number().describe("Total cost for this tool in USD"),
      })
    )
    .describe("Cost breakdown per tool"),
  totalCost: z.number().describe("Total workflow cost in USD"),
});

/**
 * Calculate cost for LLM token usage
 */
export function calculateLLMCost(
  model: string,
  usage: LLMUsage
): {
  inputCost: number;
  outputCost: number;
  cachedInputCost: number;
  totalCost: number;
} {
  const pricing = MODEL_PRICING[model];

  if (!pricing) {
    console.warn(
      `[CostTracker] Unknown model "${model}", using default gpt-4o pricing`
    );
    const defaultPricing = MODEL_PRICING["openai/gpt-4o"];
    return calculateLLMCostWithPricing(usage, defaultPricing);
  }

  return calculateLLMCostWithPricing(usage, pricing);
}

function calculateLLMCostWithPricing(
  usage: LLMUsage,
  pricing: { input: number; output: number; cachedInput?: number }
): {
  inputCost: number;
  outputCost: number;
  cachedInputCost: number;
  totalCost: number;
} {
  const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
  const cachedInputCost =
    ((usage.cachedInputTokens ?? 0) / 1_000_000) *
    (pricing.cachedInput ?? pricing.input);

  return {
    inputCost,
    outputCost,
    cachedInputCost,
    totalCost: inputCost + outputCost + cachedInputCost,
  };
}

/**
 * Calculate cost for tool token usage
 */
export function calculateToolCost(toolId: string, tokens: number): number {
  const pricePerMillion = TOOL_PRICING[toolId];

  if (!pricePerMillion) {
    console.warn(`[CostTracker] Unknown tool "${toolId}", assuming free`);
    return 0;
  }

  return (tokens / 1_000_000) * pricePerMillion;
}

/**
 * Create an empty cost breakdown
 */
export function createEmptyCostBreakdown(model: string): WorkflowCostBreakdown {
  return {
    llm: {
      model,
      calls: [],
      inputTokens: 0,
      outputTokens: 0,
      cachedInputTokens: 0,
      inputCost: 0,
      outputCost: 0,
      cachedInputCost: 0,
      totalCost: 0,
    },
    tools: {},
    totalCost: 0,
  };
}

/**
 * Add LLM usage to an existing cost breakdown
 */
export function addLLMUsage(
  breakdown: WorkflowCostBreakdown,
  model: string,
  usage: LLMUsage,
  stepId: string
): WorkflowCostBreakdown {
  const costs = calculateLLMCost(model, usage);
  const cachedInputTokens = usage.cachedInputTokens ?? 0;

  // Create new call entry
  const callEntry: LLMCallEntry = {
    stepId,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cachedInputTokens,
    inputCost: costs.inputCost,
    outputCost: costs.outputCost,
    cachedInputCost: costs.cachedInputCost,
    totalCost: costs.totalCost,
  };

  return {
    ...breakdown,
    llm: {
      model,
      calls: [...breakdown.llm.calls, callEntry],
      inputTokens: breakdown.llm.inputTokens + usage.inputTokens,
      outputTokens: breakdown.llm.outputTokens + usage.outputTokens,
      cachedInputTokens: breakdown.llm.cachedInputTokens + cachedInputTokens,
      inputCost: breakdown.llm.inputCost + costs.inputCost,
      outputCost: breakdown.llm.outputCost + costs.outputCost,
      cachedInputCost: breakdown.llm.cachedInputCost + costs.cachedInputCost,
      totalCost: breakdown.llm.totalCost + costs.totalCost,
    },
    totalCost: breakdown.totalCost + costs.totalCost,
  };
}

/**
 * Add tool usage to an existing cost breakdown
 */
export function addToolUsage(
  breakdown: WorkflowCostBreakdown,
  toolName: string,
  tokens: number
): WorkflowCostBreakdown {
  // Normalize tool name to ID (Mastra returns function names, not tool IDs)
  const toolId = normalizeToolId(toolName);
  const cost = calculateToolCost(toolId, tokens);
  const existing = breakdown.tools[toolId];

  const updatedTools = {
    ...breakdown.tools,
    [toolId]: {
      toolId,
      calls: (existing?.calls ?? 0) + 1,
      tokens: (existing?.tokens ?? 0) + tokens,
      cost: (existing?.cost ?? 0) + cost,
    },
  };

  return {
    ...breakdown,
    tools: updatedTools,
    totalCost: breakdown.totalCost + cost,
  };
}

/**
 * Merge two cost breakdowns
 */
export function mergeCostBreakdowns(
  a: WorkflowCostBreakdown,
  b: WorkflowCostBreakdown
): WorkflowCostBreakdown {
  const mergedTools = { ...a.tools };

  for (const [toolId, toolBreakdown] of Object.entries(b.tools)) {
    const existing = mergedTools[toolId];
    mergedTools[toolId] = {
      toolId,
      calls: (existing?.calls ?? 0) + toolBreakdown.calls,
      tokens: (existing?.tokens ?? 0) + toolBreakdown.tokens,
      cost: (existing?.cost ?? 0) + toolBreakdown.cost,
    };
  }

  return {
    llm: {
      model: a.llm.model || b.llm.model,
      calls: [...a.llm.calls, ...b.llm.calls],
      inputTokens: a.llm.inputTokens + b.llm.inputTokens,
      outputTokens: a.llm.outputTokens + b.llm.outputTokens,
      cachedInputTokens: a.llm.cachedInputTokens + b.llm.cachedInputTokens,
      inputCost: a.llm.inputCost + b.llm.inputCost,
      outputCost: a.llm.outputCost + b.llm.outputCost,
      cachedInputCost: a.llm.cachedInputCost + b.llm.cachedInputCost,
      totalCost: a.llm.totalCost + b.llm.totalCost,
    },
    tools: mergedTools,
    totalCost: a.totalCost + b.totalCost,
  };
}

/**
 * Format cost as a human-readable string
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(6)}`;
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Get a summary string for a cost breakdown
 */
export function getCostSummary(breakdown: WorkflowCostBreakdown): string {
  const lines: string[] = [];

  lines.push(`Total Cost: ${formatCost(breakdown.totalCost)}`);
  lines.push(
    `  LLM (${breakdown.llm.model}): ${formatCost(breakdown.llm.totalCost)}`
  );

  // Show per-call breakdown
  if (breakdown.llm.calls.length > 0) {
    for (const call of breakdown.llm.calls) {
      lines.push(
        `    - [${call.stepId}] ${call.inputTokens.toLocaleString()} in / ${call.outputTokens.toLocaleString()} out (${formatCost(call.totalCost)})`
      );
    }
  }

  // Show totals
  lines.push(
    `    Total: ${breakdown.llm.inputTokens.toLocaleString()} in / ${breakdown.llm.outputTokens.toLocaleString()} out`
  );

  if (breakdown.llm.cachedInputTokens > 0) {
    lines.push(
      `    Cached: ${breakdown.llm.cachedInputTokens.toLocaleString()} tokens (${formatCost(breakdown.llm.cachedInputCost)})`
    );
  }

  for (const [toolId, tool] of Object.entries(breakdown.tools)) {
    lines.push(`  ${toolId}: ${formatCost(tool.cost)}`);
    lines.push(
      `    - ${tool.calls} calls, ${tool.tokens.toLocaleString()} tokens`
    );
  }

  return lines.join("\n");
}
