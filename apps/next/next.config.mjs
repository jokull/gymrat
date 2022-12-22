/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
    // runtime: "experimental-edge",
    transpilePackages: ["api"],
    allowMiddlewareResponseBody: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

export default nextConfig;
