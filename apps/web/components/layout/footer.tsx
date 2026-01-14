import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("Footer");
  // Use build-time year to avoid PPR issues with new Date()
  const currentYear = 2026;

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link className="flex items-center gap-2" href="/">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-gray-900 text-xl">Baito</span>
            </Link>
            <p className="mt-4 text-gray-600 text-sm">{t("tagline")}</p>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">
              {t("jobSeekers.title")}
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link className="hover:text-gray-900" href="/jobs">
                  {t("jobSeekers.browseJobs")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/account/alerts">
                  {t("jobSeekers.jobAlerts")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/ngo">
                  {t("jobSeekers.ngoJobs")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/j/sustainability">
                  {t("jobSeekers.sustainabilityJobs")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">
              {t("employers.title")}
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link className="hover:text-gray-900" href="/org/jobs/new">
                  {t("employers.postJob")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/org/billing">
                  {t("employers.pricing")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/org/dashboard">
                  {t("employers.dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">
              {t("company.title")}
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link className="hover:text-gray-900" href="/about">
                  {t("company.about")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/contact">
                  {t("company.contact")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/privacy">
                  {t("company.privacy")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-gray-900" href="/terms">
                  {t("company.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-gray-600 text-sm">
          <p>{t("copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
}
