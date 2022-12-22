/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["api"],
  experimental: {
    appDir: true,
    allowMiddlewareResponseBody: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

export default nextConfig;
