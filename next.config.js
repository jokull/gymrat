/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["https://wwww.gymrat.is", "https://gymrat.hundrad.is"],
    },
  },
};

module.exports = nextConfig;
