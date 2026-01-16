import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { deciderAgent } from "../agents/decider-agent";
import { devilsAdvocateAgent } from "../agents/devils-advocate-agent";
import { researchAgent } from "../agents/research-agent";
import { isBotInitialized, notifyHumanReview } from "../telegram";

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
  }),
  execute: async ({ inputData }) => {
    const prompt = inputData.companyUrl
      ? `Research "${inputData.companyName}" (${inputData.companyUrl}) to gather information about their social or environmental impact. Be thorough and objective.`
      : `Research "${inputData.companyName}" to gather information about their social or environmental impact. Be thorough and objective.`;

    const result = await researchAgent.generate(prompt, {
      structuredOutput: {
        schema: researchOutputSchema,
      },
    });

    console.log(
      `[Research Agent] Completed research on "${inputData.companyName}"`
    );

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      research: result.object,
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
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
  }),
  execute: async ({ inputData }) => {
    const prompt = `
You are reviewing research findings about "${inputData.companyName}" and their claimed social/environmental impact.

## Research Findings

${JSON.stringify(inputData.research, null, 2)}

## Your Task

Critically examine these findings. Challenge the evidence, identify weaknesses, and consider alternative interpretations.
Be specific about what concerns you and why. Acknowledge strong evidence where it exists.
    `.trim();

    const result = await devilsAdvocateAgent.generate(prompt, {
      structuredOutput: {
        schema: critiqueOutputSchema,
      },
    });

    console.log(
      `[Devil's Advocate] Completed critique for "${inputData.companyName}"`
    );

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      research: inputData.research,
      critique: result.object,
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
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    research: researchOutputSchema,
    critique: critiqueOutputSchema,
    decision: decisionOutputSchema,
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

    const result = await deciderAgent.generate(prompt, {
      structuredOutput: {
        schema: decisionOutputSchema,
      },
    });

    console.log(
      `[Decider] Decision for "${inputData.companyName}": ${result.object.verdict} (confidence: ${result.object.confidence}, uncertain: ${result.object.isUncertain})`
    );

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      research: inputData.research,
      critique: inputData.critique,
      decision: result.object,
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

    // Log the final decision
    if (hasImpact) {
      console.log(
        `[Impact Assessment] Marking "${result.companyName}" as IMPACT organization`
      );
    } else {
      console.log(
        `[Impact Assessment] Marking "${result.companyName}" as BLACKLISTED (no clear impact)`
      );
    }

    return {
      companyName: result.companyName,
      verdict: result.finalVerdict,
      confidence: result.confidence,
      action: action as "marked_as_impact" | "marked_as_blacklisted",
      humanReviewed: result.humanReviewed,
      summary: result.deciderAnalysis.reasoning,
    };
  })
  .commit();
