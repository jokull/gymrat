/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    // runtime: "experimental-edge",
    transpilePackages: ["api"],
    swcPlugins: [["next-superjson-plugin", {}]],
  },
  async rewrites() {
    return [
      {
        source: "/trpc:path*",
        destination: "https://gymrat-api.solberg.workers.dev/trpc",
      },
    ];
  },
};

module.exports = nextConfig;
