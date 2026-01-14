import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description:
    "Browse thousands of impact jobs at organizations making a positive difference.",
};

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    jobType?: string;
    jobBranch?: string;
    remoteType?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl text-gray-900">Impact Jobs</h1>
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
              <h3 className="mb-2 font-medium text-gray-700 text-sm">
                Job Type
              </h3>
              <div className="space-y-2">
                {["Full Time", "Part Time", "Contract", "Internship"].map(
                  (type) => (
                    <label className="flex items-center gap-2" key={type}>
                      <input
                        className="rounded border-gray-300"
                        type="checkbox"
                      />
                      <span className="text-gray-600 text-sm">{type}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Remote Filter */}
            <div className="mb-4">
              <h3 className="mb-2 font-medium text-gray-700 text-sm">
                Work Type
              </h3>
              <div className="space-y-2">
                {["Remote", "Hybrid", "On-site"].map((type) => (
                  <label className="flex items-center gap-2" key={type}>
                    <input
                      className="rounded border-gray-300"
                      type="checkbox"
                    />
                    <span className="text-gray-600 text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <h3 className="mb-2 font-medium text-gray-700 text-sm">
                Category
              </h3>
              <div className="space-y-2">
                {["Sustainability", "Social Impact", "Health", "Education"].map(
                  (cat) => (
                    <label className="flex items-center gap-2" key={cat}>
                      <input
                        className="rounded border-gray-300"
                        type="checkbox"
                      />
                      <span className="text-gray-600 text-sm">{cat}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="lg:col-span-3">
          <Suspense fallback={<JobListSkeleton />}>
            <JobList page={Number(params.page) || 1} query={params.q} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function JobList({ query, page }: { query?: string; page: number }) {
  // In a real implementation, this would fetch from the database
  // For now, showing placeholder content
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
          key={i}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Sample Job Title {i}
              </h3>
              <p className="text-green-600">Organization Name</p>
              <p className="mt-1 text-gray-500 text-sm">
                Berlin, Germany • Remote
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-xs">
              New
            </span>
          </div>
          <p className="mb-4 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua...
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs">
              Full Time
            </span>
            <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs">
              Sustainability
            </span>
            <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs">
              Remote
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function JobListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div className="animate-pulse rounded-lg border bg-white p-6" key={i}>
          <div className="mb-4 h-6 w-2/3 rounded bg-gray-200" />
          <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-16 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
