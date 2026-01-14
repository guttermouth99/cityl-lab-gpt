import { ArrowRight, Leaf, Search, Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JobAnalyzer } from "@/components/job-analyzer";
import { Link } from "@/i18n/navigation";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("landingTitle"),
    description: t("landingDescription"),
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Landing");
  const tCommon = await getTranslations("Common");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.title")}{" "}
              <span className="text-green-600">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mb-8 text-gray-600 text-xl">{t("hero.subtitle")}</p>

            {/* Search Box */}
            <div className="mx-auto max-w-2xl">
              <form className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    className="h-14 w-full rounded-lg border border-gray-200 bg-white pr-4 pl-12 text-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    placeholder={t("hero.searchPlaceholder")}
                    type="text"
                  />
                </div>
                <button
                  className="h-14 rounded-lg bg-green-600 px-8 font-medium text-white transition-colors hover:bg-green-700"
                  type="submit"
                >
                  {t("hero.searchButton")}
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 font-medium text-green-800 text-sm hover:bg-green-200"
                href="/jobs?category=sustainability"
              >
                <Leaf className="h-4 w-4" />
                {t("categories.sustainability")}
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-800 text-sm hover:bg-blue-200"
                href="/jobs?category=social"
              >
                <Users className="h-4 w-4" />
                {t("categories.socialImpact")}
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 font-medium text-purple-800 text-sm hover:bg-purple-200"
                href="/jobs?remote=true"
              >
                {t("categories.remoteJobs")}
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
              <div className="font-bold text-3xl text-gray-900">10,000+</div>
              <div className="text-gray-600">{t("stats.activeJobs")}</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl text-gray-900">2,500+</div>
              <div className="text-gray-600">{t("stats.organizations")}</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl text-gray-900">50,000+</div>
              <div className="text-gray-600">{t("stats.monthlyVisitors")}</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl text-gray-900">100%</div>
              <div className="text-gray-600">{t("stats.impactFocused")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Analyzer Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-2 text-center font-bold text-2xl text-gray-900">
              AI Job Analyzer
            </h2>
            <p className="mb-6 text-center text-gray-600">
              Paste a job posting to analyze its category, required skills, and
              more.
            </p>
            <JobAnalyzer />
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-bold text-2xl text-gray-900">
              {t("featuredJobs.title")}
            </h2>
            <Link
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
              href="/jobs"
            >
              {t("featuredJobs.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Job cards would go here - placeholder for now */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div className="rounded-lg border bg-white p-6 shadow-sm" key={i}>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t("featuredJobs.sampleTitle")}
                    </h3>
                    <p className="text-gray-600">
                      {t("featuredJobs.sampleOrg")}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-800 text-xs">
                    {tCommon("new")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs">
                    {tCommon("fullTime")}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs">
                    {tCommon("remote")}
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
          <h2 className="mb-4 font-bold text-3xl text-white">
            {t("cta.title")}
          </h2>
          <p className="mb-8 text-green-100 text-lg">{t("cta.subtitle")}</p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-green-600 transition-colors hover:bg-green-50"
            href="/account/alerts"
          >
            {t("cta.button")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
