import { Metadata } from 'next'
import { ArrowRight, Search, Users, Leaf } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

interface LandingPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
  }
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Landing')
  const tCommon = await getTranslations('Common')

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t('hero.title')}{' '}
              <span className="text-green-600">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">{t('hero.subtitle')}</p>

            {/* Search Box */}
            <div className="mx-auto max-w-2xl">
              <form className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('hero.searchPlaceholder')}
                    className="h-14 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="h-14 rounded-lg bg-green-600 px-8 font-medium text-white transition-colors hover:bg-green-700"
                >
                  {t('hero.searchButton')}
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
                {t('categories.sustainability')}
              </Link>
              <Link
                href="/jobs?category=social"
                className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-200"
              >
                <Users className="h-4 w-4" />
                {t('categories.socialImpact')}
              </Link>
              <Link
                href="/jobs?remote=true"
                className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800 hover:bg-purple-200"
              >
                {t('categories.remoteJobs')}
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
              <div className="text-gray-600">{t('stats.activeJobs')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">2,500+</div>
              <div className="text-gray-600">{t('stats.organizations')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50,000+</div>
              <div className="text-gray-600">{t('stats.monthlyVisitors')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-gray-600">{t('stats.impactFocused')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{t('featuredJobs.title')}</h2>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              {t('featuredJobs.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Job cards would go here - placeholder for now */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('featuredJobs.sampleTitle')}</h3>
                    <p className="text-gray-600">{t('featuredJobs.sampleOrg')}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {tCommon('new')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {tCommon('fullTime')}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {tCommon('remote')}
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
          <h2 className="mb-4 text-3xl font-bold text-white">{t('cta.title')}</h2>
          <p className="mb-8 text-lg text-green-100">{t('cta.subtitle')}</p>
          <Link
            href="/account/alerts"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-green-600 transition-colors hover:bg-green-50"
          >
            {t('cta.button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
