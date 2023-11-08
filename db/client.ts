import "server-only";

import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

import { default as schema } from "../schema";

export function getDrizzle() {
  return drizzle(
    createClient({
      authToken: process.env.DATABASE_AUTH_TOKEN,
      url: process.env.DATABASE_URL ?? "",
    }),
    { schema },
  );
}

export type Database = ReturnType<typeof getDrizzle>;
