import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Building2, Briefcase, CreditCard, Settings } from 'lucide-react'

interface CustomerLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function CustomerLayout({ children, params }: CustomerLayoutProps) {
  const { locale } = await params
  
  // TODO: Check authentication and customer role
  // const session = await getSession()
  // if (!session || session.user.role !== 'customer') {
  //   redirect(`/${locale}/login`)
  // }

  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-gray-50 p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Customer Portal</h2>
            <p className="text-sm text-gray-600">Manage your job postings</p>
          </div>
          <nav className="space-y-2">
            <a href={`/${locale}/dashboard`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
              <Building2 className="h-5 w-5" />
              Dashboard
            </a>
            <a href={`/${locale}/jobs`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
              <Briefcase className="h-5 w-5" />
              My Jobs
            </a>
            <a href={`/${locale}/billing`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
              <CreditCard className="h-5 w-5" />
              Billing
            </a>
            <a href={`/${locale}/organization`} className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
              <Settings className="h-5 w-5" />
              Organization
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  )
}
