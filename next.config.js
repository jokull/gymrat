/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["gymrat.hundrad.is", "www.gymrat.is", "localhost:3800"],
    },
  },
};

module.exports = nextConfig;
