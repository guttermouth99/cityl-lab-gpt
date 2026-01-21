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
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}
