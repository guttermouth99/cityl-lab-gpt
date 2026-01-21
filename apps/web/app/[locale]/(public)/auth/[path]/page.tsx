import { AuthView } from "@daveyplate/better-auth-ui";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";

interface AuthPageProps {
  params: Promise<{ locale: string; path: string }>;
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { locale, path } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex w-full items-center justify-center p-4 md:p-6">
      <AuthView
        cardHeader={
          <div className="flex items-center justify-center gap-2">
            <Image
              alt="citylab berlin"
              height={60}
              src="/citylab_berlin_logo_square.jpeg"
              width={60}
            />
          </div>
        }
        className="shadow-2xl"
        path={path}
      />
    </main>
  );
}
