import { setRequestLocale } from "next-intl/server";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Header } from "@/components/header";

interface PrivateLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PrivateLayout({
  children,
  params,
}: PrivateLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <div className="flex min-h-0 w-full flex-1 bg-background px-4 sm:px-6 lg:px-0">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}
