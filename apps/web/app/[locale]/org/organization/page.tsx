import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organization Settings',
  description: 'Manage your organization profile',
}

export default function OrganizationPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Organization Settings</h1>

      <form className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Organization Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                defaultValue="Sample Organization"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                className="w-full rounded-lg border px-4 py-2"
                defaultValue="https://example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="h-32 w-full rounded-lg border px-4 py-2"
                defaultValue="A brief description of your organization..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 text-xl font-bold text-green-600">
                  S
                </div>
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Upload New Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
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
