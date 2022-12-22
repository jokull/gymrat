/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["api"],
  experimental: {
    appDir: true,
    runtime: "experimental-edge",
    swcPlugins: [["next-superjson-plugin", {}]],
  },
};

export default nextConfig;
