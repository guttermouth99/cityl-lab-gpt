import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function UserLayout({
  children,
  params,
}: UserLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

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
              className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              href="/account/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              href="/account/alerts"
            >
              Job Alerts
            </Link>
            <Link
              className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              href="/account/settings"
            >
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
