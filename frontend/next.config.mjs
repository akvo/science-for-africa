import i18nConfig from "./next-i18next.config.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    defaultLocale: i18nConfig.i18n.defaultLocale,
    locales: i18nConfig.i18n.locales,
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
