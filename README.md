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

# Development

The local stack expects a Cloudflare tunnel with ingress rules likes this:

```yaml
tunnel: <UUID>
credentials-file: /Users/jokull/.cloudflared/<UUID>.json
ingress:
  - hostname: gymrat.hundrad.is
    path: ^/trpc.*
    service: http://localhost:8787
  - hostname: gymrat.hundrad.is
    service: http://localhost:3800
  - service: http_status:404
```

Three processes therefore need to run.

- `localhost:8787` is run with `pnpm --filter api run start`
- `localhost:3800` is run with `pnpm --filter next run dev`
- Then

You might need to run the Kysely codegen

```bash
pnpm --filter api run db-codegen
```

Prisma is used to compose a schema and potentially help with creating migration
scripts.

Template `app/next/.env`

```
HOST=
CLERK_JWT_KEY=
CLERK_API_KEY=
NEXT_PUBLIC_CLERK_FRONTEND_API=
```

Template `packages/api/.env`

```
DATABASE_URL=
PRISMA_DATABASE_URL=
```

Template `packages/api/.dev.vars`

```
CLERK_JWT_KEY=
```

Initialize the remote D1 db

```
pnpx wrangler d1 execute gymrat-api --file ./prisma/migrations/20221204224336_initial/migration.sql
```
