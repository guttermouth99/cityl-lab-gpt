import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Manage Organizations",
  description: "Admin organization management",
};

interface AdminOrganizationsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminOrganizationsPage({
  params,
}: AdminOrganizationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <h1 className="mb-6 font-bold text-2xl text-gray-900">
        Manage Organizations
      </h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="rounded-lg border bg-white px-4 py-2">
          <option>All Types</option>
          <option>Impact</option>
          <option>Non-Impact</option>
          <option>Blacklisted</option>
        </select>
        <input
          className="flex-1 rounded-lg border bg-white px-4 py-2"
          placeholder="Search organizations..."
          type="search"
        />
      </div>

      {/* Organizations Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600 text-sm">
                Organization
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 text-sm">
                Domain
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 text-sm">
                Jobs
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 text-sm">
                Type
              </th>
              <th className="px-6 py-3 text-right font-medium text-gray-600 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <tr className="hover:bg-gray-50" key={i}>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">Organization {i}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">example{i}.com</td>
                <td className="px-6 py-4 text-gray-600">{5 * i}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      i % 2 === 0
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {i % 2 === 0 ? "Impact" : "Standard"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-green-600 text-sm hover:text-green-700">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
