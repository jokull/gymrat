/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@gymrat/api"],
  experimental: {
    appDir: true,
    runtime: "edge",
    // swcPlugins: [["next-superjson-plugin", {}]],
  },
};

export default nextConfig;
