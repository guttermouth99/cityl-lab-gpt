"use client";

import { Menu, Search, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Header");

  const handleLanguageSwitch = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link className="flex items-center gap-2" href="/">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-gray-900 text-xl">Baito</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link className="text-gray-600 hover:text-gray-900" href="/jobs">
            {t("jobs")}
          </Link>
          <Link className="text-gray-600 hover:text-gray-900" href="/ngo">
            {t("ngos")}
          </Link>
          <Link
            className="text-gray-600 hover:text-gray-900"
            href="/j/sustainability"
          >
            {t("sustainability")}
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            type="button"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            href="/account/dashboard"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-sm text-white hover:bg-green-700"
            href="/org/jobs/new"
          >
            {t("postJob")}
          </Link>
          {/* Language Switcher */}
          <div className="flex gap-1 rounded-lg border p-1">
            <button
              className="rounded px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleLanguageSwitch("de")}
              type="button"
            >
              DE
            </button>
            <button
              className="rounded px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleLanguageSwitch("en")}
              type="button"
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 p-4">
            <Link
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("jobs")}
            </Link>
            <Link
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              href="/ngo"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("ngos")}
            </Link>
            <Link
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              href="/account/dashboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("dashboard")}
            </Link>
            <Link
              className="rounded-lg bg-green-600 px-4 py-2 text-center text-white hover:bg-green-700"
              href="/org/jobs/new"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("postJob")}
            </Link>
            {/* Mobile Language Switcher */}
            <div className="flex gap-2 px-4 pt-2">
              <button
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  handleLanguageSwitch("de");
                  setMobileMenuOpen(false);
                }}
                type="button"
              >
                Deutsch
              </button>
              <button
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  handleLanguageSwitch("en");
                  setMobileMenuOpen(false);
                }}
                type="button"
              >
                English
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
