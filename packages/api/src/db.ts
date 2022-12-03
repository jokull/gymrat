import { Kysely } from "kysely";
import { DB } from "kysely-codegen";
import { D1Dialect } from "kysely-d1";

export interface Env {
  DB: D1Database;
}

export function getQueryBuilder(d1: D1Database) {
  return new Kysely<DB>({
    dialect: new D1Dialect({ database: d1 }),
  });
}
