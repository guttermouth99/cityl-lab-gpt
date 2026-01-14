'use client'

import { useState } from 'react'
import { Menu, X, Search, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('Header')

  const handleLanguageSwitch = (newLocale: string) => {
    router.push(pathname, { locale: newLocale })
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-gray-900">Baito</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/jobs" className="text-gray-600 hover:text-gray-900">
            {t('jobs')}
          </Link>
          <Link href="/ngo" className="text-gray-600 hover:text-gray-900">
            {t('ngos')}
          </Link>
          <Link href="/j/sustainability" className="text-gray-600 hover:text-gray-900">
            {t('sustainability')}
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/account/dashboard"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/org/jobs/new"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {t('postJob')}
          </Link>
          {/* Language Switcher */}
          <div className="flex gap-1 rounded-lg border p-1">
            <button
              onClick={() => handleLanguageSwitch('de')}
              className="rounded px-2 py-1 text-sm hover:bg-gray-100"
            >
              DE
            </button>
            <button
              onClick={() => handleLanguageSwitch('en')}
              className="rounded px-2 py-1 text-sm hover:bg-gray-100"
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 p-4">
            <Link
              href="/jobs"
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('jobs')}
            </Link>
            <Link
              href="/ngo"
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('ngos')}
            </Link>
            <Link
              href="/account/dashboard"
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              href="/org/jobs/new"
              className="rounded-lg bg-green-600 px-4 py-2 text-center text-white hover:bg-green-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('postJob')}
            </Link>
            {/* Mobile Language Switcher */}
            <div className="flex gap-2 px-4 pt-2">
              <button
                onClick={() => {
                  handleLanguageSwitch('de')
                  setMobileMenuOpen(false)
                }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                Deutsch
              </button>
              <button
                onClick={() => {
                  handleLanguageSwitch('en')
                  setMobileMenuOpen(false)
                }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                English
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
