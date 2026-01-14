import { setRequestLocale } from 'next-intl/server'
import { Header } from '@/components/layout/header'
import { Link } from '@/i18n/navigation'
import { Shield, Briefcase, Building2, Users, Settings } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)

  // TODO: Check authentication and admin role
  // const session = await getSession()
  // if (!session || session.user.role !== 'admin') {
  //   redirect(`/${locale}/login`)
  // }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-gray-900 p-4">
          <div className="mb-6 flex items-center gap-2 text-white">
            <Shield className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <nav className="space-y-2">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Settings className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/jobs"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Briefcase className="h-5 w-5" />
              Jobs
            </Link>
            <Link
              href="/admin/organizations"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Building2 className="h-5 w-5" />
              Organizations
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Users className="h-5 w-5" />
              Customers
            </Link>
          </nav>
        </aside>
        <main className="flex-1 bg-gray-100 p-8">{children}</main>
      </div>
    </>
  )
}
