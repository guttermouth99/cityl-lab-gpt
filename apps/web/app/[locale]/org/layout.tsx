import { Briefcase, Building2, CreditCard, Settings } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";

interface CustomerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CustomerLayout({
  children,
  params,
}: CustomerLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

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
            <h2 className="font-semibold text-gray-900 text-lg">
              Customer Portal
            </h2>
            <p className="text-gray-600 text-sm">Manage your job postings</p>
          </div>
          <nav className="space-y-2">
            <Link
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              href="/org/dashboard"
            >
              <Building2 className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              href="/org/jobs"
            >
              <Briefcase className="h-5 w-5" />
              My Jobs
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              href="/org/billing"
            >
              <CreditCard className="h-5 w-5" />
              Billing
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              href="/org/organization"
            >
              <Settings className="h-5 w-5" />
              Organization
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
