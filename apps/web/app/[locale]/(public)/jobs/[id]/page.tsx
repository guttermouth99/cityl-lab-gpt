import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, Building2, ExternalLink } from 'lucide-react'

interface JobPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { id } = await params
  
  // In a real implementation, fetch job from database
  // For now, return placeholder metadata
  return {
    title: `Job: ${id}`,
    description: 'Job description placeholder',
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { locale, id } = await params
  
  // In a real implementation, fetch job from database
  // For now, showing placeholder content
  const job = {
    title: 'Sample Job Title',
    organization: {
      name: 'Sample Organization',
      slug: 'sample-org',
    },
    location: 'Berlin, Germany',
    remoteType: 'Hybrid',
    jobType: 'Full Time',
    description: `
# About the Role

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Responsibilities

- Responsibility 1
- Responsibility 2
- Responsibility 3

## Requirements

- Requirement 1
- Requirement 2
- Requirement 3

## Benefits

- Benefit 1
- Benefit 2
- Benefit 3
    `,
    createdAt: new Date(),
    externalUrl: 'https://example.com/apply',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/${locale}/jobs`}
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white p-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{job.title}</h1>
            <Link
              href={`/${locale}/orga/${job.organization.slug}`}
              className="text-lg text-green-600 hover:underline"
            >
              {job.organization.name}
            </Link>

            <div className="mt-4 flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {job.jobType}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {job.remoteType}
              </span>
            </div>

            <hr className="my-6" />

            {/* Job Description */}
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Apply Now</h2>
            <a
              href={job.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
            >
              Apply
              <ExternalLink className="h-4 w-4" />
            </a>
            
            <hr className="my-4" />

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Posted</span>
                <span className="font-medium text-gray-900">
                  {job.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Job Type</span>
                <span className="font-medium text-gray-900">{job.jobType}</span>
              </div>
              <div className="flex justify-between">
                <span>Location</span>
                <span className="font-medium text-gray-900">{job.remoteType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
