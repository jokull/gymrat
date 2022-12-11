/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    // runtime: "experimental-edge",
    transpilePackages: ["api"],
    allowMiddlewareResponseBody: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

module.exports = nextConfig;
