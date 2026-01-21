import { setRequestLocale } from "next-intl/server";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <main className="flex-1">{children}</main>;
}
