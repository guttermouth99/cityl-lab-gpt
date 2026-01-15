import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Post a Job",
  description: "Create a new job posting",
};

interface NewJobPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewJobPage({ params }: NewJobPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <h1 className="mb-6 font-bold text-2xl text-gray-900">Post a New Job</h1>

      <form className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900 text-lg">
            Job Details
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm"
                htmlFor="job-title"
              >
                Job Title *
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2"
                id="job-title"
                placeholder="e.g., Sustainability Manager"
                required
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm"
                htmlFor="job-description"
              >
                Description *
              </label>
              <textarea
                className="h-48 w-full rounded-lg border px-4 py-2"
                id="job-description"
                placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-1 block font-medium text-gray-700 text-sm"
                  htmlFor="job-type"
                >
                  Job Type
                </label>
                <select
                  className="w-full rounded-lg border px-4 py-2"
                  id="job-type"
                >
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label
                  className="mb-1 block font-medium text-gray-700 text-sm"
                  htmlFor="remote-type"
                >
                  Remote Type
                </label>
                <select
                  className="w-full rounded-lg border px-4 py-2"
                  id="remote-type"
                >
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm"
                htmlFor="job-location"
              >
                Location
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2"
                id="job-location"
                placeholder="e.g., Berlin, Germany"
                type="text"
              />
            </div>

            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm"
                htmlFor="application-url"
              >
                Application URL
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2"
                id="application-url"
                placeholder="https://your-company.com/apply"
                type="url"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            className="rounded-lg border px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
            type="button"
          >
            Save as Draft
          </button>
          <button
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
            type="submit"
          >
            Publish Job
          </button>
        </div>
      </form>
    </div>
  );
}
