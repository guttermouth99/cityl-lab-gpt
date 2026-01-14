import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Jobs',
  description: 'Admin job management',
}

export default function AdminJobsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Manage Jobs</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="rounded-lg border bg-white px-4 py-2">
          <option>All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Expired</option>
        </select>
        <select className="rounded-lg border bg-white px-4 py-2">
          <option>All Sources</option>
          <option>Organic</option>
          <option>Feed</option>
          <option>Scraped</option>
        </select>
        <input
          type="search"
          placeholder="Search jobs..."
          className="flex-1 rounded-lg border bg-white px-4 py-2"
        />
      </div>

      {/* Jobs Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Job</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Organization</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Source</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Created</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">Sample Job Title {i}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">Organization {i}</td>
                <td className="px-6 py-4">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {i % 3 === 0 ? 'Feed' : i % 2 === 0 ? 'Scraped' : 'Organic'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    i % 4 === 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {i % 4 === 0 ? 'Pending' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{i} days ago</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-green-600 hover:text-green-700">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
