import { InferSelectModel, relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const user = sqliteTable("User", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`)
    .notNull(),
  apiKey: text("apiKey").notNull(),
  email: text("email").unique().notNull(),
  displayEmail: text("displayEmail").notNull(),
  hashedPassword: text("hashedPassword").notNull(),
});

export const workout = sqliteTable("Workout", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`)
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  description: text("description").notNull(),
  value: text("value").notNull(),
  numberValue: integer("numberValue").default(0).notNull(),
  isTime: integer("isTime", { mode: "boolean" }).default(false).notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

// Define relationships
export const userRelations = relations(user, ({ many }) => ({
  workouts: many(workout),
}));

// Create schemas for insert and select operations using Drizzle Zod, if needed
export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);

export const insertWorkoutSchema = createInsertSchema(workout);
export const selectWorkoutSchema = createSelectSchema(workout);

export type User = InferSelectModel<typeof user>;
export type Workout = InferSelectModel<typeof workout>;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  user,
  workout,
  userRelations,
  insertUserSchema,
  selectUserSchema,
  insertWorkoutSchema,
  selectWorkoutSchema,
};
