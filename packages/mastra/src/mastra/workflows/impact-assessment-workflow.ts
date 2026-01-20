import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { deciderAgent } from "../agents/decider-agent";
import { devilsAdvocateAgent } from "../agents/devils-advocate-agent";
import { researchAgent } from "../agents/research-agent";
import { isBotInitialized, notifyHumanReview } from "../telegram";
import {
  addLLMUsage,
  addToolUsage,
  createEmptyCostBreakdown,
  formatCost,
  getCostSummary,
  mergeCostBreakdowns,
  workflowCostBreakdownSchema,
} from "../utils/cost-tracker";

/**
 * Schema for research findings from the Research Agent
 */
const researchOutputSchema = z.object({
  organizationName: z.string().describe("Name of the organization researched"),
  organizationUrl: z.string().nullable().describe("URL if provided, or null"),
  certificationsAndRatings: z
    .array(
      z.object({
        name: z.string().describe("Name of certification or rating"),
        details: z.string().describe("Details about the certification"),
        source: z
          .enum(["self-reported", "third-party"])
          .describe("Whether this is self-reported or third-party verified"),
        url: z.string().nullable().describe("Source URL if available, or null"),
      })
    )
    .describe("Certifications and ratings found"),
  programsAndInitiatives: z
    .array(
      z.object({
        name: z.string().describe("Name of the program"),
        description: z.string().describe("Description of the program"),
        hasMetrics: z.boolean().describe("Whether measurable outcomes exist"),
      })
    )
    .describe("Programs and initiatives found"),
  metricsAndData: z
    .array(
      z.object({
        metric: z.string().describe("The metric or data point"),
        value: z.string().describe("The value or claim"),
        isVerified: z
          .boolean()
          .describe("Whether this is independently verified"),
      })
    )
    .describe("Quantifiable metrics and data points"),
  thirdPartySources: z
    .array(
      z.object({
        source: z.string().describe("Name of the source"),
        type: z
          .enum(["news", "award", "criticism", "review", "audit"])
          .describe("Type of source"),
        summary: z.string().describe("Brief summary of what the source says"),
        sentiment: z
          .enum(["positive", "negative", "neutral"])
          .describe("Overall sentiment"),
      })
    )
    .describe("Third-party sources found"),
  informationGaps: z
    .array(z.string())
    .describe("Information that could not be found"),
});

/**
 * Schema for Devil's Advocate critique
 */
const critiqueOutputSchema = z.object({
  evidenceQualityConcerns: z
    .array(
      z.object({
        concern: z.string().describe("The specific concern"),
        severity: z
          .enum(["minor", "moderate", "significant"])
          .describe("How serious this concern is"),
        whatWouldResolveIt: z
          .string()
          .describe("What information would address this concern"),
      })
    )
    .describe("Concerns about the quality of evidence"),
  greenwashingIndicators: z
    .array(
      z.object({
        indicator: z.string().describe("The potential greenwashing indicator"),
        explanation: z.string().describe("Why this is concerning"),
      })
    )
    .describe("Potential signs of greenwashing or impact-washing"),
  missingInformation: z
    .array(z.string())
    .describe("Important information that should exist but was not found"),
  alternativeInterpretations: z
    .array(
      z.object({
        claim: z.string().describe("The original claim from research"),
        alternativeView: z.string().describe("An alternative interpretation"),
      })
    )
    .describe("Alternative ways to interpret the evidence"),
  strongEvidence: z
    .array(z.string())
    .describe("Evidence that IS credible and hard to dispute"),
  overallAssessment: z
    .string()
    .describe(
      "Summary of the critique - are concerns minor or do they seriously undermine the case?"
    ),
});

/**
 * Schema for Decider's final determination
 */
const decisionOutputSchema = z.object({
  verdict: z
    .enum(["Has Impact", "No Clear Impact", "Insufficient Information"])
    .describe("Final verdict on organizational impact"),
  confidence: z
    .enum(["High", "Medium", "Low"])
    .describe("Confidence in the verdict"),
  isUncertain: z
    .boolean()
    .describe(
      "Whether this should be escalated to human review due to uncertainty"
    ),
  reasoning: z.string().describe("Detailed explanation of the decision"),
  keyFactors: z
    .array(z.string())
    .describe("The most important factors that influenced the decision"),
  unresolvedConcerns: z
    .array(z.string())
    .describe("Concerns that could not be fully addressed"),
});

/**
 * Step 1: Research
 * The Research Agent gathers objective information about the organization
 */
const researchStep = createStep({
  id: "research",
  inputSchema: z.object({
    companyName: z.string().describe("Name of the company to assess"),
    companyUrl: z.string().url().optional().describe("Optional company URL"),
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  execute: async ({ inputData }) => {
    const prompt = inputData.companyUrl
      ? `Research "${inputData.companyName}" (${inputData.companyUrl}) to gather information about their social or environmental impact. Be thorough and objective.`
      : `Research "${inputData.companyName}" to gather information about their social or environmental impact. Be thorough and objective.`;

    console.log(
      `[Research Agent] Input prompt (${prompt.length} chars):\n${prompt}`
    );
    console.log(
      `[Research Agent] Starting research for "${inputData.companyName}"...`
    );

    const result = await researchAgent.generate(prompt, {
      structuredOutput: {
        schema: researchOutputSchema,
      },
    });

    // Initialize cost tracking
    let costs = createEmptyCostBreakdown("openai/gpt-4o");

    // Log usage details
    console.log(
      "[Research Agent] Usage reported:",
      JSON.stringify(result.usage, null, 2)
    );
    console.log(
      `[Research Agent] Tool results count: ${result.toolResults?.length ?? 0}`
    );
    if (result.toolResults && Array.isArray(result.toolResults)) {
      for (const toolResult of result.toolResults) {
        const payload = (
          toolResult as { payload?: { toolName?: string; result?: unknown } }
        ).payload;
        if (payload) {
          console.log(
            `[Research Agent] Tool "${payload.toolName}" result:`,
            JSON.stringify(payload.result, null, 2).slice(0, 500) + "..."
          );
        }
      }
    }

    // Track LLM usage
    if (result.usage) {
      costs = addLLMUsage(
        costs,
        "openai/gpt-4o",
        {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          cachedInputTokens: result.usage.cachedInputTokens ?? 0,
          totalTokens: result.usage.totalTokens ?? 0,
        },
        "research"
      );
    }

    // Track tool usage from tool results
    // Tool results come as ToolResultChunk with payload containing toolName and result
    if (result.toolResults && Array.isArray(result.toolResults)) {
      for (const toolResultChunk of result.toolResults) {
        // Access toolName and result from payload (ToolResultChunk structure)
        const payload = (
          toolResultChunk as {
            payload?: { toolName?: string; result?: unknown };
          }
        ).payload;
        if (!payload) continue;

        const toolName = payload.toolName;
        const toolOutput = payload.result;

        if (
          toolName &&
          toolOutput &&
          typeof toolOutput === "object" &&
          "tokensUsed" in toolOutput
        ) {
          const tokens = (toolOutput as { tokensUsed: number }).tokensUsed;
          if (tokens > 0) {
            costs = addToolUsage(costs, toolName, tokens);
          }
        }
      }
    }

    console.log(
      `[Research Agent] Completed research on "${inputData.companyName}" - Cost: ${formatCost(costs.totalCost)}`
    );

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      research: result.object,
      costs,
    };
  },
});

/**
 * Step 2: Devil's Advocate
 * Challenges and critiques the research findings
 */
const devilsAdvocateStep = createStep({
  id: "devils-advocate",
  inputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  execute: async ({ inputData }) => {
    const prompt = `
You are reviewing research findings about "${inputData.companyName}" and their claimed social/environmental impact.

## Research Findings

${JSON.stringify(inputData.research, null, 2)}

## Your Task

1. **Use your search tools** to verify key claims and find counter-evidence:
   - Search for "${inputData.companyName} controversy" or "${inputData.companyName} criticism"
   - Search for "${inputData.companyName} greenwashing" if applicable
   - Verify any certifications or ratings mentioned are current and legitimate
   - Look for news or information the research may have missed

2. **Critically examine** the findings. Challenge the evidence, identify weaknesses, and consider alternative interpretations.

3. **Be specific** about what concerns you and why. Acknowledge strong evidence where it exists.
    `.trim();

    console.log(
      `[Devil's Advocate] Input prompt (${prompt.length} chars):\n${prompt}`
    );
    console.log(
      `[Devil's Advocate] Research data size: ${JSON.stringify(inputData.research).length} chars`
    );

    const result = await devilsAdvocateAgent.generate(prompt, {
      structuredOutput: {
        schema: critiqueOutputSchema,
      },
    });

    // Log usage details
    console.log(
      `[Devil's Advocate] Usage reported:`,
      JSON.stringify(result.usage, null, 2)
    );
    console.log(
      `[Devil's Advocate] Tool results count: ${result.toolResults?.length ?? 0}`
    );
    if (result.toolResults && Array.isArray(result.toolResults)) {
      for (const toolResult of result.toolResults) {
        const payload = (
          toolResult as { payload?: { toolName?: string; result?: unknown } }
        ).payload;
        if (payload) {
          console.log(
            `[Devil's Advocate] Tool "${payload.toolName}" result:`,
            JSON.stringify(payload.result, null, 2).slice(0, 500) + "..."
          );
        }
      }
    }
    console.log(
      `[Devil's Advocate] Output object:`,
      JSON.stringify(result.object, null, 2).slice(0, 1000) + "..."
    );

    // Track LLM usage and merge with previous costs
    let stepCosts = createEmptyCostBreakdown("openai/gpt-4o");
    if (result.usage) {
      stepCosts = addLLMUsage(
        stepCosts,
        "openai/gpt-4o",
        {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          cachedInputTokens: result.usage.cachedInputTokens ?? 0,
          totalTokens: result.usage.totalTokens ?? 0,
        },
        "devils-advocate"
      );
    }

    // Track tool usage from tool results
    if (result.toolResults && Array.isArray(result.toolResults)) {
      for (const toolResultChunk of result.toolResults) {
        const payload = (
          toolResultChunk as {
            payload?: { toolName?: string; result?: unknown };
          }
        ).payload;
        if (!payload) continue;

        const toolName = payload.toolName;
        const toolOutput = payload.result;

        if (
          toolName &&
          toolOutput &&
          typeof toolOutput === "object" &&
          "tokensUsed" in toolOutput
        ) {
          const tokens = (toolOutput as { tokensUsed: number }).tokensUsed;
          if (tokens > 0) {
            stepCosts = addToolUsage(stepCosts, toolName, tokens);
          }
        }
      }
    }

    const costs = mergeCostBreakdowns(inputData.costs, stepCosts);

    console.log(
      `[Devil's Advocate] Completed critique for "${inputData.companyName}" - Step cost: ${formatCost(stepCosts.totalCost)}, Total: ${formatCost(costs.totalCost)}`
    );

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      research: inputData.research,
      critique: result.object,
      costs,
    };
  },
});

/**
 * Step 3: Decider
 * Weighs both arguments and makes a determination
 */
const deciderStep = createStep({
  id: "decider",
  inputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    decision: decisionOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  execute: async ({ inputData }) => {
    const prompt = `
You are making a final determination about "${inputData.companyName}" and whether they have genuine social or environmental impact.

## Research Findings

${JSON.stringify(inputData.research, null, 2)}

## Devil's Advocate Critique

${JSON.stringify(inputData.critique, null, 2)}

## Your Task

Weigh both the research findings and the critique. Make a final determination.
Remember: if you're not confident, set isUncertain to true so this can be escalated to human review.
    `.trim();

    console.log(`[Decider] Input prompt (${prompt.length} chars):\n${prompt}`);
    console.log(
      `[Decider] Research data size: ${JSON.stringify(inputData.research).length} chars`
    );
    console.log(
      `[Decider] Critique data size: ${JSON.stringify(inputData.critique).length} chars`
    );

    const result = await deciderAgent.generate(prompt, {
      structuredOutput: {
        schema: decisionOutputSchema,
      },
    });

    // Log usage details
    console.log(
      "[Decider] Usage reported:",
      JSON.stringify(result.usage, null, 2)
    );
    console.log(
      "[Decider] Output object:",
      JSON.stringify(result.object, null, 2)
    );

    // Track LLM usage and merge with previous costs
    let stepCosts = createEmptyCostBreakdown("openai/gpt-4o");
    if (result.usage) {
      stepCosts = addLLMUsage(
        stepCosts,
        "openai/gpt-4o",
        {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          cachedInputTokens: result.usage.cachedInputTokens ?? 0,
          totalTokens: result.usage.totalTokens ?? 0,
        },
        "decider"
      );
    }

    const costs = mergeCostBreakdowns(inputData.costs, stepCosts);

    console.log(
      `[Decider] Decision for "${inputData.companyName}": ${result.object.verdict} (confidence: ${result.object.confidence}, uncertain: ${result.object.isUncertain}) - Step cost: ${formatCost(stepCosts.totalCost)}, Total: ${formatCost(costs.totalCost)}`
    );

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      research: inputData.research,
      critique: inputData.critique,
      decision: result.object,
      costs,
    };
  },
});

/**
 * Step 4a: Human Review (when uncertain)
 * Suspends the workflow for human input
 */
const humanReviewStep = createStep({
  id: "human-review",
  inputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    decision: decisionOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    finalVerdict: z.enum([
      "Has Impact",
      "No Clear Impact",
      "Insufficient Information",
    ]),
    confidence: z.enum(["High", "Medium", "Low"]),
    humanReviewed: z.boolean(),
    humanNotes: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    deciderAnalysis: decisionOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  resumeSchema: z.object({
    humanVerdict: z.enum([
      "Has Impact",
      "No Clear Impact",
      "Insufficient Information",
    ]),
    humanNotes: z.string().optional(),
  }),
  suspendSchema: z.object({
    reason: z.string(),
    companyName: z.string(),
    deciderVerdict: z.string(),
    deciderConfidence: z.string(),
    deciderReasoning: z.string(),
    unresolvedConcerns: z.array(z.string()),
  }),
  execute: async ({ inputData, resumeData, suspend, runId }) => {
    // If we have resume data, the human has made a decision
    if (resumeData) {
      console.log(
        `[Human Review] Human decision received for "${inputData.companyName}": ${resumeData.humanVerdict}`
      );

      return {
        companyName: inputData.companyName,
        companyUrl: inputData.companyUrl,
        finalVerdict: resumeData.humanVerdict,
        confidence: "High" as const, // Human decisions are high confidence
        humanReviewed: true,
        humanNotes: resumeData.humanNotes,
        research: inputData.research,
        critique: inputData.critique,
        deciderAnalysis: inputData.decision,
        costs: inputData.costs,
      };
    }

    // Suspend for human input
    console.log(
      `[Human Review] Suspending for human review of "${inputData.companyName}"`
    );

    // Send Telegram notification if bot is initialized
    if (isBotInitialized()) {
      console.log(
        `[Human Review] Sending Telegram notification for "${inputData.companyName}" (runId: ${runId})`
      );

      try {
        await notifyHumanReview(runId, {
          companyName: inputData.companyName,
          deciderVerdict: inputData.decision.verdict,
          deciderConfidence: inputData.decision.confidence,
          deciderReasoning: inputData.decision.reasoning,
          unresolvedConcerns: inputData.decision.unresolvedConcerns,
        });
        console.log(
          `[Human Review] Telegram notification sent successfully for "${inputData.companyName}"`
        );
      } catch (error) {
        console.error(
          `[Human Review] Failed to send Telegram notification for "${inputData.companyName}":`,
          error
        );
        // Don't throw - we still want to suspend even if Telegram fails
      }
    } else {
      console.log(
        `[Human Review] Telegram bot not initialized, skipping notification for "${inputData.companyName}". ` +
          "User can still respond via Mastra UI."
      );
    }

    return await suspend({
      reason: "Decider uncertain - human review required",
      companyName: inputData.companyName,
      deciderVerdict: inputData.decision.verdict,
      deciderConfidence: inputData.decision.confidence,
      deciderReasoning: inputData.decision.reasoning,
      unresolvedConcerns: inputData.decision.unresolvedConcerns,
    });
  },
});

/**
 * Step 4b: Direct Decision (when confident)
 * Passes through the decision when no human review is needed
 */
const directDecisionStep = createStep({
  id: "direct-decision",
  inputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    decision: decisionOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    finalVerdict: z.enum([
      "Has Impact",
      "No Clear Impact",
      "Insufficient Information",
    ]),
    confidence: z.enum(["High", "Medium", "Low"]),
    humanReviewed: z.boolean(),
    humanNotes: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    deciderAnalysis: decisionOutputSchema,
    costs: workflowCostBreakdownSchema,
  }),
  execute: async ({ inputData }) => {
    console.log(
      `[Direct Decision] Proceeding with confident decision for "${inputData.companyName}"`
    );

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      finalVerdict: inputData.decision.verdict,
      confidence: inputData.decision.confidence,
      humanReviewed: false,
      humanNotes: undefined,
      research: inputData.research,
      critique: inputData.critique,
      deciderAnalysis: inputData.decision,
      costs: inputData.costs,
    };
  },
});

/**
 * Impact Assessment Workflow with Devil's Advocate Pattern
 *
 * Flow:
 * 1. Research Agent gathers information
 * 2. Devil's Advocate critiques the findings
 * 3. Decider weighs both and makes determination
 * 4. If uncertain -> Human Review (HITL suspend/resume)
 *    If confident -> Direct Decision
 * 5. Branch to mark as impact or blacklisted
 */
export const impactAssessmentWorkflow = createWorkflow({
  id: "impact-assessment-workflow",
  inputSchema: z.object({
    companyName: z.string().describe("Name of the company to assess"),
    companyUrl: z
      .string()
      .url()
      .optional()
      .describe("Optional URL of the company website"),
  }),
  outputSchema: z.object({
    companyName: z.string(),
    verdict: z.enum([
      "Has Impact",
      "No Clear Impact",
      "Insufficient Information",
    ]),
    confidence: z.enum(["High", "Medium", "Low"]),
    action: z.enum(["marked_as_impact", "marked_as_blacklisted"]),
    humanReviewed: z.boolean(),
    summary: z.string(),
    costs: workflowCostBreakdownSchema.describe(
      "Cost breakdown for the entire workflow run"
    ),
  }),
})
  // Step 1: Research
  .then(researchStep)
  // Step 2: Devil's Advocate critique
  .then(devilsAdvocateStep)
  // Step 3: Decider weighs arguments
  .then(deciderStep)
  // Step 4: Branch based on uncertainty (human review or direct decision)
  .branch([
    [
      // If uncertain, route to human review
      async ({ inputData }) => inputData.decision.isUncertain,
      humanReviewStep,
    ],
    [
      // If confident, proceed directly
      async ({ inputData }) => !inputData.decision.isUncertain,
      directDecisionStep,
    ],
  ])
  // Step 5: Finalize and return result
  .map(async ({ inputData, getStepResult }) => {
    // Get result from whichever branch executed
    const humanResult = getStepResult(humanReviewStep);
    const directResult = getStepResult(directDecisionStep);
    const result = humanResult ?? directResult;

    if (!result) {
      throw new Error("No branch result found");
    }

    const hasImpact = result.finalVerdict === "Has Impact";
    const action = hasImpact ? "marked_as_impact" : "marked_as_blacklisted";

    // Log the final decision with cost summary
    if (hasImpact) {
      console.log(
        `[Impact Assessment] Marking "${result.companyName}" as IMPACT organization`
      );
    } else {
      console.log(
        `[Impact Assessment] Marking "${result.companyName}" as BLACKLISTED (no clear impact)`
      );
    }

    console.log(
      `[Impact Assessment] Cost Summary:\n${getCostSummary(result.costs)}`
    );

    return {
      companyName: result.companyName,
      verdict: result.finalVerdict,
      confidence: result.confidence,
      action: action as "marked_as_impact" | "marked_as_blacklisted",
      humanReviewed: result.humanReviewed,
      summary: result.deciderAnalysis.reasoning,
      costs: result.costs,
    };
  })
  .commit();
