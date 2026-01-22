import { AccountView, accountViewPaths } from "@daveyplate/better-auth-ui";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.values(accountViewPaths).map((path) => ({ locale, path }))
  );
}

interface AccountPageProps {
  params: Promise<{ locale: string; path: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale, path } = await params;
  setRequestLocale(locale);

  return (
    <main className="container py-8">
      <AccountView path={path} />
    </main>
  );
}
