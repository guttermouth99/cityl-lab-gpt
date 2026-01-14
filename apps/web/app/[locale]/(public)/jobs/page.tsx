import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Browse Jobs',
  description: 'Browse thousands of impact jobs at organizations making a positive difference.',
}

interface JobsPageProps {
  searchParams: Promise<{
    q?: string
    page?: string
    jobType?: string
    jobBranch?: string
    remoteType?: string
  }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Impact Jobs</h1>
        <p className="mt-2 text-gray-600">
          Find meaningful work at organizations making a difference
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-4 font-semibold text-gray-900">Filters</h2>
            
            {/* Job Type Filter */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Job Type</h3>
              <div className="space-y-2">
                {['Full Time', 'Part Time', 'Contract', 'Internship'].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Remote Filter */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Work Type</h3>
              <div className="space-y-2">
                {['Remote', 'Hybrid', 'On-site'].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Category</h3>
              <div className="space-y-2">
                {['Sustainability', 'Social Impact', 'Health', 'Education'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="lg:col-span-3">
          <Suspense fallback={<JobListSkeleton />}>
            <JobList query={params.q} page={Number(params.page) || 1} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function JobList({ query, page }: { query?: string; page: number }) {
  // In a real implementation, this would fetch from the database
  // For now, showing placeholder content
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sample Job Title {i}
              </h3>
              <p className="text-green-600">Organization Name</p>
              <p className="mt-1 text-sm text-gray-500">Berlin, Germany • Remote</p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              New
            </span>
          </div>
          <p className="mb-4 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua...
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
              Full Time
            </span>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
              Sustainability
            </span>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
              Remote
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function JobListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border bg-white p-6">
          <div className="mb-4 h-6 w-2/3 rounded bg-gray-200" />
          <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-16 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}
