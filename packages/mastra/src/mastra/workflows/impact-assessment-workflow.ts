import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { impactAssessmentAgent } from "../agents/impact-assessment-agent";

/**
 * Schema for the structured assessment output from the agent
 */
const assessmentOutputSchema = z.object({
  summary: z.string().describe("Brief overview of the organization"),
  evidenceOfImpact: z
    .array(z.string())
    .describe("List of concrete evidence found"),
  redFlags: z.array(z.string()).describe("List of concerns or red flags"),
  confidenceLevel: z
    .enum(["High", "Medium", "Low"])
    .describe("Confidence in the assessment"),
  verdict: z
    .enum(["Has Impact", "No Clear Impact", "Insufficient Information"])
    .describe("Final verdict on organizational impact"),
});

/**
 * Step 1: Assess Impact
 * Calls the impact assessment agent to analyze the organization
 */
const assessImpactStep = createStep({
  id: "assess-impact",
  inputSchema: z.object({
    companyName: z.string().describe("Name of the company to assess"),
    companyUrl: z.string().url().optional().describe("Optional company URL"),
  }),
  outputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    assessment: assessmentOutputSchema,
  }),
  execute: async ({ inputData }) => {
    const prompt = inputData.companyUrl
      ? `Assess if "${inputData.companyName}" (${inputData.companyUrl}) has genuine social or environmental impact.`
      : `Assess if "${inputData.companyName}" has genuine social or environmental impact.`;

    const result = await impactAssessmentAgent.generate(prompt, {
      output: assessmentOutputSchema,
    });

    return {
      companyName: inputData.companyName,
      companyUrl: inputData.companyUrl,
      assessment: result.object,
    };
  },
});

/**
 * Step 2a: Mark as Impact
 * Handles organizations that have genuine impact
 */
const markAsImpactStep = createStep({
  id: "mark-as-impact",
  inputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    assessment: assessmentOutputSchema,
  }),
  outputSchema: z.object({
    companyName: z.string(),
    verdict: z.enum([
      "Has Impact",
      "No Clear Impact",
      "Insufficient Information",
    ]),
    confidenceLevel: z.enum(["High", "Medium", "Low"]),
    summary: z.string(),
    action: z.literal("marked_as_impact"),
    evidenceOfImpact: z.array(z.string()),
  }),
  execute: ({ inputData }) => {
    // In production, this would update the database:
    // await db.update(organizations).set({ isImpact: true }).where(eq(organizations.name, inputData.companyName));

    console.log(
      `[Impact Assessment] Marking "${inputData.companyName}" as IMPACT organization`
    );

    return {
      companyName: inputData.companyName,
      verdict: inputData.assessment.verdict,
      confidenceLevel: inputData.assessment.confidenceLevel,
      summary: inputData.assessment.summary,
      action: "marked_as_impact" as const,
      evidenceOfImpact: inputData.assessment.evidenceOfImpact,
    };
  },
});

/**
 * Step 2b: Mark as Blacklisted
 * Handles organizations without clear impact
 */
const markAsBlacklistedStep = createStep({
  id: "mark-as-blacklisted",
  inputSchema: z.object({
    companyName: z.string(),
    companyUrl: z.string().optional(),
    assessment: assessmentOutputSchema,
  }),
  outputSchema: z.object({
    companyName: z.string(),
    verdict: z.enum([
      "Has Impact",
      "No Clear Impact",
      "Insufficient Information",
    ]),
    confidenceLevel: z.enum(["High", "Medium", "Low"]),
    summary: z.string(),
    action: z.literal("marked_as_blacklisted"),
    redFlags: z.array(z.string()),
  }),
  execute: ({ inputData }) => {
    // In production, this would update the database:
    // await db.update(organizations).set({ isBlacklisted: true }).where(eq(organizations.name, inputData.companyName));

    console.log(
      `[Impact Assessment] Marking "${inputData.companyName}" as BLACKLISTED (no clear impact)`
    );

    return {
      companyName: inputData.companyName,
      verdict: inputData.assessment.verdict,
      confidenceLevel: inputData.assessment.confidenceLevel,
      summary: inputData.assessment.summary,
      action: "marked_as_blacklisted" as const,
      redFlags: inputData.assessment.redFlags,
    };
  },
});

/**
 * Final step to consolidate branch outputs
 */
const finalizeStep = createStep({
  id: "finalize",
  inputSchema: z.object({
    "mark-as-impact": z
      .object({
        companyName: z.string(),
        verdict: z.enum([
          "Has Impact",
          "No Clear Impact",
          "Insufficient Information",
        ]),
        confidenceLevel: z.enum(["High", "Medium", "Low"]),
        summary: z.string(),
        action: z.literal("marked_as_impact"),
        evidenceOfImpact: z.array(z.string()),
      })
      .optional(),
    "mark-as-blacklisted": z
      .object({
        companyName: z.string(),
        verdict: z.enum([
          "Has Impact",
          "No Clear Impact",
          "Insufficient Information",
        ]),
        confidenceLevel: z.enum(["High", "Medium", "Low"]),
        summary: z.string(),
        action: z.literal("marked_as_blacklisted"),
        redFlags: z.array(z.string()),
      })
      .optional(),
  }),
  outputSchema: z.object({
    companyName: z.string(),
    verdict: z.enum([
      "Has Impact",
      "No Clear Impact",
      "Insufficient Information",
    ]),
    confidenceLevel: z.enum(["High", "Medium", "Low"]),
    summary: z.string(),
    action: z.enum(["marked_as_impact", "marked_as_blacklisted"]),
  }),
  execute: ({ inputData }) => {
    const impactResult = inputData["mark-as-impact"];
    const blacklistResult = inputData["mark-as-blacklisted"];

    if (impactResult) {
      return {
        companyName: impactResult.companyName,
        verdict: impactResult.verdict,
        confidenceLevel: impactResult.confidenceLevel,
        summary: impactResult.summary,
        action: impactResult.action,
      };
    }

    if (blacklistResult) {
      return {
        companyName: blacklistResult.companyName,
        verdict: blacklistResult.verdict,
        confidenceLevel: blacklistResult.confidenceLevel,
        summary: blacklistResult.summary,
        action: blacklistResult.action,
      };
    }

    throw new Error("No branch result found");
  },
});

/**
 * Impact Assessment Workflow
 *
 * Flow:
 * 1. Receive company name (and optional URL)
 * 2. Run impact assessment agent
 * 3. Branch based on verdict:
 *    - "Has Impact" -> mark as impact org
 *    - "No Clear Impact" / "Insufficient Information" -> mark as blacklisted
 * 4. Return final result
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
    confidenceLevel: z.enum(["High", "Medium", "Low"]),
    summary: z.string(),
    action: z.enum(["marked_as_impact", "marked_as_blacklisted"]),
  }),
})
  .then(assessImpactStep)
  .branch([
    [
      async ({ inputData }) => inputData.assessment.verdict === "Has Impact",
      markAsImpactStep,
    ],
    [
      async ({ inputData }) => inputData.assessment.verdict !== "Has Impact",
      markAsBlacklistedStep,
    ],
  ])
  .then(finalizeStep)
  .commit();
