import { ArrowLeft, Globe, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

interface OrgPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: OrgPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Organization: ${slug}`,
    description: "Organization profile",
  };
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { locale, slug } = await params;

  // Placeholder organization data
  const org = {
    name: "Sample Organization",
    description:
      "A mission-driven organization working on sustainability and social impact.",
    url: "https://example.com",
    isImpact: true,
    jobCount: 5,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        href={`/${locale}/jobs`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Organization Header */}
      <div className="mb-8 rounded-lg border bg-white p-8">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-green-100 font-bold text-2xl text-green-600">
            {org.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-3xl text-gray-900">{org.name}</h1>
            {org.isImpact && (
              <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-sm">
                Impact Organization
              </span>
            )}
            <p className="mt-4 text-gray-600">{org.description}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-gray-600 text-sm">
              {org.url && (
                <a
                  className="flex items-center gap-1 hover:text-green-600"
                  href={org.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {org.jobCount} open positions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs at this organization */}
      <h2 className="mb-4 font-bold text-gray-900 text-xl">Open Positions</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Link
            className="block rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
            href={`/${locale}/jobs/sample-job-${i}`}
            key={i}
          >
            <h3 className="font-semibold text-gray-900 text-lg">
              Sample Job {i}
            </h3>
            <p className="mt-1 text-gray-500 text-sm">
              Berlin, Germany • Remote
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs">
                Full Time
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
