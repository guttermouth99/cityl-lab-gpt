import { task, schedules } from '@trigger.dev/sdk/v3'
import { chunk } from '@baito/shared'
import { processFeedBatch } from './process-feed-batch'

interface FeedJob {
  externalId: string
  title: string
  description: string
  organizationName: string
  url: string
  location?: string
}

export const syncStepstone = schedules.task({
  id: 'sync-stepstone',
  // Run every hour
  cron: '0 * * * *',
  run: async () => {
    const feedUrl = process.env.STEPSTONE_FEED_URL
    if (!feedUrl) {
      throw new Error('STEPSTONE_FEED_URL not configured')
    }

    // Fetch the feed
    console.log('Fetching Stepstone feed...')
    const response = await fetch(feedUrl)
    const feedData = await response.json() as FeedJob[]
    
    console.log(`Found ${feedData.length} jobs in feed`)

    // Chunk into batches of 50
    const batches = chunk(feedData, 50)
    console.log(`Split into ${batches.length} batches`)

    // Spawn batch processing tasks
    const batchTasks = batches.map((batch, index) =>
      processFeedBatch.trigger({
        batchIndex: index,
        jobs: batch,
        source: 'stepstone',
      }),
    )

    await Promise.all(batchTasks)

    return {
      totalJobs: feedData.length,
      batches: batches.length,
    }
  },
})
