import "dotenv/config";

import type { Config } from "drizzle-kit";

export default {
  out: "./drizzle",
  schema: "./schema.ts",
  strict: true,
  verbose: true,
  ...(process.env.DATABASE_AUTH_TOKEN && process.env.NODE_ENV == "production"
    ? {
        driver: "turso",
        dbCredentials: {
          url: process.env.DATABASE_URL ?? "",
          authToken: process.env.DATABASE_AUTH_TOKEN,
        },
      }
    : {
        driver: "libsql",
        dbCredentials: { url: process.env.DATABASE_URL ?? "" },
      }),
} satisfies Config;
