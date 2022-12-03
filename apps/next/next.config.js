/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/trpc:path*",
  //       destination:
  //         process.env.NODE_ENV === "development"
  //           ? "http://localhost:3800/trpc:path*"
  //           : "http://api.gymrat.com/trpc:path*",
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
