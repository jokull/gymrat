/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    // runtime: "experimental-edge",
    transpilePackages: ["api"],
  },
};

module.exports = nextConfig;
