import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search, Building2, Users, Leaf } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find Impact Jobs | Baito Jobs',
  description: 'Discover meaningful careers at organizations making a difference. Browse jobs in sustainability, social impact, NGOs, and more.',
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find work that{' '}
              <span className="text-green-600">makes a difference</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Discover meaningful careers at organizations creating positive impact.
              From sustainability to social justice, find your next opportunity.
            </p>
            
            {/* Search Box */}
            <div className="mx-auto max-w-2xl">
              <form className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="h-14 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="h-14 rounded-lg bg-green-600 px-8 font-medium text-white transition-colors hover:bg-green-700"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/jobs?category=sustainability"
                className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-200"
              >
                <Leaf className="h-4 w-4" />
                Sustainability
              </Link>
              <Link
                href="/jobs?category=social"
                className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-200"
              >
                <Users className="h-4 w-4" />
                Social Impact
              </Link>
              <Link
                href="/jobs?remote=true"
                className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800 hover:bg-purple-200"
              >
                Remote Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">2,500+</div>
              <div className="text-gray-600">Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50,000+</div>
              <div className="text-gray-600">Monthly Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-gray-600">Impact Focused</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              View all jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Job cards would go here - placeholder for now */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Sample Job Title</h3>
                    <p className="text-gray-600">Organization Name</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    New
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    Full Time
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    Remote
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to make an impact?
          </h2>
          <p className="mb-8 text-lg text-green-100">
            Create job alerts and never miss a new opportunity.
          </p>
          <Link
            href="/alerts"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-green-600 transition-colors hover:bg-green-50"
          >
            Set Up Job Alerts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
