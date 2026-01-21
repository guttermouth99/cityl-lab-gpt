import { AuthView } from "@daveyplate/better-auth-ui";
import { setRequestLocale } from "next-intl/server";

interface AuthPageProps {
  params: Promise<{ locale: string; path: string }>;
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { locale, path } = await params;
  setRequestLocale(locale);

  return (
    <main className="container flex grow flex-col items-center justify-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
