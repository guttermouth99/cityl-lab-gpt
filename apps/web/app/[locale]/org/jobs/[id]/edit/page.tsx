import { Metadata } from 'next'

interface EditJobPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: EditJobPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Edit Job ${id}`,
    description: 'Edit your job posting',
  }
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params
  
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Job</h1>

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
                defaultValue={`Sample Job ${id}`}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                className="h-48 w-full rounded-lg border px-4 py-2"
                defaultValue="Existing job description..."
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
                  Status
                </label>
                <select className="w-full rounded-lg border px-4 py-2">
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="rounded-lg border px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
