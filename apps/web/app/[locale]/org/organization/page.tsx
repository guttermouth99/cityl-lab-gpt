import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Settings",
  description: "Manage your organization profile",
};

export default function OrganizationPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-2xl text-gray-900">
        Organization Settings
      </h1>

      <form className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900 text-lg">
            Organization Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-medium text-gray-700 text-sm">
                Organization Name
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2"
                defaultValue="Sample Organization"
                type="text"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-gray-700 text-sm">
                Website
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2"
                defaultValue="https://example.com"
                type="url"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-gray-700 text-sm">
                Description
              </label>
              <textarea
                className="h-32 w-full rounded-lg border px-4 py-2"
                defaultValue="A brief description of your organization..."
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-gray-700 text-sm">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 font-bold text-green-600 text-xl">
                  S
                </div>
                <button
                  className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
                  type="button"
                >
                  Upload New Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
            type="submit"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
