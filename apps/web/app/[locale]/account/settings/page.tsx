import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences",
};

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <h1 className="mb-6 font-bold text-2xl text-gray-900">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900 text-lg">Profile</h2>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm"
                htmlFor="settings-name"
              >
                Name
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2"
                id="settings-name"
                placeholder="Your name"
                type="text"
              />
            </div>
            <div>
              <label
                className="mb-1 block font-medium text-gray-700 text-sm"
                htmlFor="settings-email"
              >
                Email
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2"
                id="settings-email"
                placeholder="your@email.com"
                type="email"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900 text-lg">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                className="rounded border-gray-300"
                defaultChecked
                type="checkbox"
              />
              <span className="text-gray-700">Daily job digest</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                className="rounded border-gray-300"
                defaultChecked
                type="checkbox"
              />
              <span className="text-gray-700">Weekly newsletter</span>
            </label>
            <label className="flex items-center gap-3">
              <input className="rounded border-gray-300" type="checkbox" />
              <span className="text-gray-700">Instant job alerts</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
            type="button"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
