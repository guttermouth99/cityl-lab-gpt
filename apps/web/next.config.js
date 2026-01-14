import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@baito/ui', '@baito/db', '@baito/shared', '@baito/search'],
  cacheComponents: true,
}

export default withNextIntl(nextConfig)
