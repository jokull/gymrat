# Gymrat

Goal is to be the simplest and fastest way to track your weight lifting progress.

- Drizzle
- Turso
- Next.js App Router w/ server actions
- ... that's it! Super simple stack. No react-query or tRPC.

## Development

The local stack expects a Cloudflare tunnel with ingress rules likes this:

```yaml
tunnel: <UUID>
credentials-file: /Users/jokull/.cloudflared/<UUID>.json
ingress:
  - hostname: gymrat.hundrad.is
    service: http://localhost:3800
  - service: http_status:404
```

```bash
bun install
bun run tunnel
bun run dev  # in another tab
bun run sqld  # in the third tab
bun run db:push  # to seed the db
```

Template `.env.local`

```
HOST=gymrat.hundrad.is
SECRET_KEY=  # generate with `openssl rand -base64 32`
DATABASE_URL=ws://127.0.0.1:3040
DATABASE_AUTH_TOKEN=
```

## Production

Initialize the production db

```
# signup with turso, install the turso cli
turso db create gymrat --from-dump seed.sql
turso db show --url gymrat  # for the prod `DATABASE_URL` value
turso tokens create gymrat  # for the prod `DATABASE_AUTH_TOKEN` value
```

Enter each of the four Vercel variables. Deploy. Happy days.

## Analytics

Active users

```sql
WITH RankedWorkouts AS (
    SELECT
        w."updatedAt",
        w."userId",
        u."email",
        ROW_NUMBER() OVER(PARTITION BY w."userId" ORDER BY w."updatedAt" DESC) AS rn
    FROM "Workout" w
    JOIN "User" u ON w."userId" = u."id"
)

SELECT
    "email",
    "updatedAt" AS "activeDate"
FROM RankedWorkouts
WHERE rn = 1
ORDER BY "activeDate" DESC;
```

Total workouts tracked per month

```sql
SELECT
    strftime('%Y-%m', w."updatedAt") AS "monthYear",
    COUNT(w."id") AS "totalWorkouts",
    COUNT(DISTINCT w."userId") AS "uniqueUsersActive"
FROM "Workout" w
GROUP BY "monthYear"
ORDER BY "monthYear" DESC;
```
