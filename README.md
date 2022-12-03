# Gymrat Monorepo

![](https://ss.solberg.is/LyufAM+)

Goal is to be the simplest and fastest way to track your weight lifting progress.

- Raycast extension to search and record lifts at light speed
- tRPC Backend
  - Using Cloudflare Workers (`fetchRequestHandler`)
  - D1 with type safe Kysely query building
- Next.js web frontend (proxies `/api/trpc` to the backend `/trpc`) (WIP)
- Clerk auth and signup

Since Vercel uses Cloudflare Worker behind the scenes for `experimental-edge` the proxying from
Next.js backend to the tRPC backend should not add much latency. Arguably it would be an improvement
to make Vercel host tRPC but I could not find an elegant way to make D1 bindings accessible to
Next.js. Track [this issue](https://github.com/cloudflare/next-on-pages/issues/1) if interested.
