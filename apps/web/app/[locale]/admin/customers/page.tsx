import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Customers',
  description: 'Admin customer management',
}

export default function AdminCustomersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Manage Customers</h1>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">156</p>
          <p className="text-sm text-gray-600">Total Customers</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">€15,420</p>
          <p className="text-sm text-gray-600">Monthly Revenue</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-600">New This Month</p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Organization</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Plan</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Jobs Used</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">Customer {i}</p>
                  <p className="text-sm text-gray-600">customer{i}@example.com</p>
                </td>
                <td className="px-6 py-4 text-gray-600">Organization {i}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    i % 3 === 0 
                      ? 'bg-purple-100 text-purple-800' 
                      : i % 2 === 0 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {i % 3 === 0 ? 'Enterprise' : i % 2 === 0 ? 'Professional' : 'Starter'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{i * 2} / {i * 5}</td>
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
