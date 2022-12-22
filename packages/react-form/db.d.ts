import { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface _PrismaMigrations {
  applied_steps_count: Generated<string>;
  checksum: string;
  finished_at: string | null;
  id: string;
  logs: string | null;
  migration_name: string;
  rolled_back_at: string | null;
  started_at: Generated<string>;
}

export interface User {
  apiKey: string;
  displayEmail: string;
  email: string;
  hashedPassword: string;
  id: string;
}

export interface Workout {
  date: string;
  description: string;
  id: string;
  isTime: Generated<string>;
  numberValue: Generated<number>;
  updatedAt: string;
  userId: string;
  value: string;
}

export interface DB {
  _prisma_migrations: _PrismaMigrations;
  User: User;
  Workout: Workout;
}
