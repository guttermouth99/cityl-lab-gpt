import { Metadata } from 'next'
import Link from 'next/link'
import { JOB_BRANCH_LABELS, type JobBranch } from '@baito/shared'

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const label = JOB_BRANCH_LABELS[category as JobBranch] || category
  
  return {
    title: `${label} Jobs`,
    description: `Find ${label.toLowerCase()} jobs at impact organizations.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params
  const label = JOB_BRANCH_LABELS[category as JobBranch] || category

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{label} Jobs</h1>
        <p className="mt-2 text-gray-600">
          Find {label.toLowerCase()} jobs at organizations making a positive impact
        </p>
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Link
            key={i}
            href={`/${locale}/jobs/category-job-${i}`}
            className="block rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">{label} Position {i}</h3>
            <p className="mt-1 text-green-600">Impact Organization</p>
            <p className="mt-1 text-sm text-gray-500">Berlin, Germany • Full Time</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                {label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return Object.keys(JOB_BRANCH_LABELS).map((category) => ({ category }))
}
