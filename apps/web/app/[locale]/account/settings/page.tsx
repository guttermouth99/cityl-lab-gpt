import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences',
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border px-4 py-2"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="text-gray-700">Daily job digest</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="text-gray-700">Weekly newsletter</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-gray-700">Instant job alerts</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
