import { Metadata } from 'next'
import { Briefcase, Building2, Users, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Platform administration dashboard',
}

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12,345</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2,567</p>
              <p className="text-sm text-gray-600">Organizations</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">45,678</p>
              <p className="text-sm text-gray-600">Users</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-orange-100 p-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">+12%</p>
              <p className="text-sm text-gray-600">Growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Jobs</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">Sample Job {i}</p>
                  <p className="text-sm text-gray-600">Organization {i}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Organizations</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">Organization {i}</p>
                  <p className="text-sm text-gray-600">{5 * i} jobs</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  Impact
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
