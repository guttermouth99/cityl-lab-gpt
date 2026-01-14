import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-gray-900">Baito</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Find meaningful work at organizations making a positive impact.
            </p>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Job Seekers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/jobs" className="hover:text-gray-900">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="hover:text-gray-900">
                  Job Alerts
                </Link>
              </li>
              <li>
                <Link href="/ngo" className="hover:text-gray-900">
                  NGO Jobs
                </Link>
              </li>
              <li>
                <Link href="/j/sustainability" className="hover:text-gray-900">
                  Sustainability Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Employers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/jobs/new" className="hover:text-gray-900">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Baito Jobs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
