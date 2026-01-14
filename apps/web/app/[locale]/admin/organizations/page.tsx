import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Organizations',
  description: 'Admin organization management',
}

export default function AdminOrganizationsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Manage Organizations</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="rounded-lg border bg-white px-4 py-2">
          <option>All Types</option>
          <option>Impact</option>
          <option>Non-Impact</option>
          <option>Blacklisted</option>
        </select>
        <input
          type="search"
          placeholder="Search organizations..."
          className="flex-1 rounded-lg border bg-white px-4 py-2"
        />
      </div>

      {/* Organizations Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Organization</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Domain</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Jobs</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Type</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">Organization {i}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">example{i}.com</td>
                <td className="px-6 py-4 text-gray-600">{5 * i}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    i % 2 === 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {i % 2 === 0 ? 'Impact' : 'Standard'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm text-green-600 hover:text-green-700">
                    Edit
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
