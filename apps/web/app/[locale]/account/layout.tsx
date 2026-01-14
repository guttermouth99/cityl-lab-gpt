import { setRequestLocale } from 'next-intl/server'
import { Header } from '@/components/layout/header'
import { Link } from '@/i18n/navigation'

interface UserLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)

  // TODO: Check authentication
  // const session = await getSession()
  // if (!session) {
  //   redirect(`/${locale}/login`)
  // }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-gray-50 p-4">
          <nav className="space-y-2">
            <Link
              href="/account/dashboard"
              className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link
              href="/account/alerts"
              className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Job Alerts
            </Link>
            <Link
              href="/account/settings"
              className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  )
}
