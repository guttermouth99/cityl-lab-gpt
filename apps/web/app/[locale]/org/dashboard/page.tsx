import { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, Eye, Users, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'Manage your job postings and view analytics',
}

interface CustomerDashboardProps {
  params: Promise<{ locale: string }>
}

export default async function CustomerDashboardPage({ params }: CustomerDashboardProps) {
  const { locale } = await params
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href={`/${locale}/jobs/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-gray-600">Active Jobs</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-gray-600">Total Views</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-gray-600">Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Jobs</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <h3 className="font-medium text-gray-900">Sample Job {i}</h3>
                <p className="text-sm text-gray-600">Posted 3 days ago • 45 views</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
