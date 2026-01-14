'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Search, User } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en'

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-gray-900">Baito</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}/jobs`}
            className="text-gray-600 hover:text-gray-900"
          >
            Jobs
          </Link>
          <Link
            href={`/${locale}/ngo`}
            className="text-gray-600 hover:text-gray-900"
          >
            NGOs
          </Link>
          <Link
            href={`/${locale}/j/sustainability`}
            className="text-gray-600 hover:text-gray-900"
          >
            Sustainability
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={`/${locale}/dashboard`}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href={`/${locale}/jobs/new`}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Post a Job
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              href={`/${locale}/jobs`}
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Jobs
            </Link>
            <Link
              href={`/${locale}/ngo`}
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              NGOs
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href={`/${locale}/jobs/new`}
              className="rounded-lg bg-green-600 px-4 py-2 text-center text-white hover:bg-green-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Post a Job
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
