import { task } from '@trigger.dev/sdk/v3'
import { classifyJob as classifyJobLLM } from '@baito/llm'
import { getJobById } from '@baito/db/queries'
import { db } from '@baito/db'
import { jobs } from '@baito/db/schema'
import { eq } from 'drizzle-orm'

export const classifyJobTask = task({
  id: 'classify-job',
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { jobId: string }) => {
    const { jobId } = payload
    
    const job = await getJobById(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    console.log(`Classifying job: ${job.title}`)

    // Use LLM to classify the job
    const result = await classifyJobLLM({
      title: job.title,
      description: job.description,
      organizationName: job.organization?.name,
    })

    console.log(`Classification result:`, result)

    // Update the job with classification
    await db
      .update(jobs)
      .set({
        jobType: result.jobType as any,
        jobBranch: result.jobBranch as any,
        remoteType: result.remoteType as any,
        experienceLevel: result.experienceLevel as any,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))

    return {
      jobId,
      title: job.title,
      classification: result,
    }
  },
})
