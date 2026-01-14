import { Bell, Briefcase, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personal job search dashboard",
};

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-2xl text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-2xl text-gray-900">3</p>
              <p className="text-gray-600">Active Alerts</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-2xl text-gray-900">12</p>
              <p className="text-gray-600">Jobs Matched</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-100 p-3">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-2xl text-gray-900">5</p>
              <p className="text-gray-600">Saved Jobs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">
          Recent Activity
        </h2>
        <p className="text-gray-600">No recent activity to show.</p>
      </div>
    </div>
  );
}
