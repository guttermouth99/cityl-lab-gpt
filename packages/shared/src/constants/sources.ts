// Job Sources - where jobs come from
export const JOB_SOURCES = {
  organic: 'organic',      // Direct customer posting
  paid: 'paid',            // Paid job board listing
  cpa: 'cpa',              // Cost per application
  flatrate: 'flatrate',    // Flat rate feed (e.g., Stepstone)
  agency: 'agency',        // Recruitment agency feed
  scraped: 'scraped',      // Scraped from career pages
} as const

export type JobSource = (typeof JOB_SOURCES)[keyof typeof JOB_SOURCES]

export const JOB_SOURCE_LABELS: Record<JobSource, string> = {
  organic: 'Direct Posting',
  paid: 'Paid Listing',
  cpa: 'Cost Per Application',
  flatrate: 'Feed Partner',
  agency: 'Agency',
  scraped: 'Scraped',
}

// Feed sources configuration
export const FEED_SOURCES = {
  stepstone: {
    id: 'stepstone',
    name: 'Stepstone',
    type: 'flatrate' as JobSource,
    active: true,
  },
  fantasticJobs: {
    id: 'fantastic_jobs',
    name: 'Fantastic Jobs',
    type: 'flatrate' as JobSource,
    active: true,
  },
  goodJobs: {
    id: 'good_jobs',
    name: 'Good Jobs',
    type: 'cpa' as JobSource,
    active: true,
  },
} as const

export type FeedSourceId = keyof typeof FEED_SOURCES

export function getFeedSource(id: string) {
  return Object.values(FEED_SOURCES).find((source) => source.id === id)
}
