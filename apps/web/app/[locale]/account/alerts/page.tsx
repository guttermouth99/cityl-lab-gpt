import { Bell, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Job Alerts",
  description: "Manage your job alerts and notification preferences",
};

interface AlertsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AlertsPage({ params }: AlertsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-2xl text-gray-900">Job Alerts</h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Create Alert
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div className="rounded-lg border bg-white p-6" key={i}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Alert {i}</h3>
                  <p className="text-gray-600 text-sm">
                    Keywords: sustainability, climate • Remote • Full Time
                  </p>
                  <p className="mt-1 text-gray-500 text-sm">
                    5 new jobs this week
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {false}
    </div>
  );
}
