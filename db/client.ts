import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "../schema";
import { relations } from "../schema";

let _db: ReturnType<typeof createDb> | undefined;

function createDb() {
  return drizzle(env.DB, { schema, relations });
}

export function getDrizzle() {
  _db ??= createDb();
  return _db;
}

export type Database = ReturnType<typeof getDrizzle>;
