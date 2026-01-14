import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Jobs',
  description: 'Manage your job postings',
}

interface CustomerJobsProps {
  params: Promise<{ locale: string }>
}

export default async function CustomerJobsPage({ params }: CustomerJobsProps) {
  const { locale } = await params
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Link
          href={`/${locale}/jobs/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      {/* Jobs Table */}
      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Job</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Views</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Posted</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">Sample Job Title {i}</p>
                    <p className="text-sm text-gray-600">Berlin, Germany</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    i % 2 === 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {i % 2 === 0 ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{45 * i}</td>
                <td className="px-6 py-4 text-gray-600">{i} days ago</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/${locale}/jobs/sample-${i}/edit`}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <a
                      href={`/jobs/sample-${i}`}
                      target="_blank"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
