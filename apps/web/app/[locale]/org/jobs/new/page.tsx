import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post a Job',
  description: 'Create a new job posting',
}

export default function NewJobPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Post a New Job</h1>

      <form className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Job Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                placeholder="e.g., Sustainability Manager"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                className="h-48 w-full rounded-lg border px-4 py-2"
                placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                <select className="w-full rounded-lg border px-4 py-2">
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Remote Type
                </label>
                <select className="w-full rounded-lg border px-4 py-2">
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                placeholder="e.g., Berlin, Germany"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Application URL
              </label>
              <input
                type="url"
                className="w-full rounded-lg border px-4 py-2"
                placeholder="https://your-company.com/apply"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="rounded-lg border px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
          >
            Publish Job
          </button>
        </div>
      </form>
    </div>
  )
}
