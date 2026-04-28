const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
  },
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // In Docker, 'localhost' doesn't work for server-to-server communication.
    // We use the service name 'backend' instead.
    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337/api"
    )
      .replace("/api", "")
      .replace("localhost", "backend");

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};
