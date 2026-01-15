import { db } from "@baito/db";
import { getJobById } from "@baito/db/queries";
import { jobs } from "@baito/db/schema";
import { classifyJob as classifyJobLLM } from "@baito/llm";
import { task } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";

export const classifyJobTask = task({
  id: "classify-job",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { jobId: string }) => {
    const { jobId } = payload;

    const job = await getJobById(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    console.log(`Classifying job: ${job.title}`);

    // Use LLM to classify the job
    const result = await classifyJobLLM({
      title: job.title,
      description: job.description,
      organizationName: job.organization?.name,
    });

    console.log("Classification result:", result);

    // Update the job with classification
    // biome-ignore lint/suspicious/noExplicitAny: LLM result types need runtime validation
    const jobType = result.jobType as any;
    // biome-ignore lint/suspicious/noExplicitAny: LLM result types need runtime validation
    const jobBranch = result.jobBranch as any;
    // biome-ignore lint/suspicious/noExplicitAny: LLM result types need runtime validation
    const remoteType = result.remoteType as any;
    // biome-ignore lint/suspicious/noExplicitAny: LLM result types need runtime validation
    const experienceLevel = result.experienceLevel as any;

    await db
      .update(jobs)
      .set({
        jobType,
        jobBranch,
        remoteType,
        experienceLevel,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    return {
      jobId,
      title: job.title,
      classification: result,
    };
  },
});
