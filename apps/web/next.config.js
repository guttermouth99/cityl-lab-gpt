/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@baito/ui', '@baito/db', '@baito/shared', '@baito/search'],
  cacheComponents: true,
}

export default nextConfig
