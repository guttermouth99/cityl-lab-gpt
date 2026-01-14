import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-gray-900 text-xl">Baito</span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </header>
  );
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
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
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
