import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function Footer() {
  const t = await getTranslations('Footer')

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
            <p className="mt-4 text-sm text-gray-600">{t('tagline')}</p>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">{t('jobSeekers.title')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/jobs" className="hover:text-gray-900">
                  {t('jobSeekers.browseJobs')}
                </Link>
              </li>
              <li>
                <Link href="/account/alerts" className="hover:text-gray-900">
                  {t('jobSeekers.jobAlerts')}
                </Link>
              </li>
              <li>
                <Link href="/ngo" className="hover:text-gray-900">
                  {t('jobSeekers.ngoJobs')}
                </Link>
              </li>
              <li>
                <Link href="/j/sustainability" className="hover:text-gray-900">
                  {t('jobSeekers.sustainabilityJobs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">{t('employers.title')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/org/jobs/new" className="hover:text-gray-900">
                  {t('employers.postJob')}
                </Link>
              </li>
              <li>
                <Link href="/org/billing" className="hover:text-gray-900">
                  {t('employers.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/org/dashboard" className="hover:text-gray-900">
                  {t('employers.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">{t('company.title')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  {t('company.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  {t('company.contact')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900">
                  {t('company.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900">
                  {t('company.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-600">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
