import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "NGO Jobs",
  description:
    "Find jobs at nonprofit organizations, NGOs, and charitable foundations making a positive impact.",
};

interface NgoPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NgoPage({ params }: NgoPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl text-gray-900">
          NGO & Nonprofit Jobs
        </h1>
        <p className="mt-2 text-gray-600">
          Find meaningful careers at nonprofit organizations, NGOs, and
          charitable foundations
        </p>
      </div>

      {/* Featured NGOs */}
      <section className="mb-12">
        <h2 className="mb-4 font-bold text-gray-900 text-xl">
          Featured Organizations
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Link
              className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
              href={`/orga/sample-ngo-${i}`}
              key={i}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Sample NGO {i}
                  </h3>
                  <p className="text-gray-600 text-sm">5 open positions</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest NGO Jobs */}
      <section>
        <h2 className="mb-4 font-bold text-gray-900 text-xl">
          Latest NGO Jobs
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Link
              className="block rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
              href={`/jobs/ngo-job-${i}`}
              key={i}
            >
              <h3 className="font-semibold text-gray-900 text-lg">
                NGO Job Title {i}
              </h3>
              <p className="mt-1 text-green-600">Sample NGO Organization</p>
              <p className="mt-1 text-gray-500 text-sm">
                Berlin, Germany • Full Time
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
