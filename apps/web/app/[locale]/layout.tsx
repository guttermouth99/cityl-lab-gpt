import '@baito/ui/globals.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const locales = ['de', 'en'] as const
type Locale = (typeof locales)[number]

export const metadata: Metadata = {
  metadataBase: new URL('https://baito.jobs'),
  title: {
    default: 'Baito Jobs - Impact Career Platform',
    template: '%s | Baito Jobs',
  },
  description: 'Find meaningful work at organizations making a positive impact. Jobs in sustainability, social impact, NGOs, and more.',
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
