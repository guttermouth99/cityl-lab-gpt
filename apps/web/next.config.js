import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@baito/ui",
    "@baito/db",
    "@baito/shared",
    "@baito/search",
    "@baito/mastra",
  ],
  serverExternalPackages: ["@mastra/*"],
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
