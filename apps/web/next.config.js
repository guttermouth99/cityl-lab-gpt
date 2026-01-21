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
      { protocol: "https", hostname: "citylab-berlin.de" },
      { protocol: "https", hostname: "citylab-berlin.org" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default withNextIntl(nextConfig);
