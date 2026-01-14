import { task, schedules } from '@trigger.dev/sdk/v3'
import { expireOldJobs, getExpiredJobsCount } from '@baito/db/queries'

export const expireJobsTask = schedules.task({
  id: 'expire-jobs',
  // Run every day at midnight
  cron: '0 0 * * *',
  run: async () => {
    console.log('Starting job expiration check')

    // Get count of jobs that should be expired
    const expiredCount = await getExpiredJobsCount()
    console.log(`Found ${expiredCount} jobs to expire`)

    if (expiredCount === 0) {
      return { expired: 0 }
    }

    // Expire jobs
    await expireOldJobs(new Date())

    console.log(`Expired ${expiredCount} jobs`)

    return {
      expired: expiredCount,
    }
  },
})
