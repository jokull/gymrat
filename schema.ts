import type { InferSelectModel } from "drizzle-orm";
import { defineRelations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("User", {
	id: text("id").primaryKey().notNull(),
	apiKey: text("apiKey").notNull(),
	email: text("email").unique().notNull(),
	displayEmail: text("displayEmail").notNull(),
	hashedPassword: text("hashedPassword").notNull(),
});

export const workout = sqliteTable("Workout", {
	id: text("id").primaryKey().notNull(),
	updatedAt: integer("updatedAt", { mode: "timestamp" })
		.notNull()
		.$default(() => new Date()),
	description: text("description").notNull(),
	comment: text("comment"),
	value: text("value").notNull(),
	numberValue: integer("numberValue").default(0).notNull(),
	isTime: integer("isTime", { mode: "boolean" }).default(false).notNull(),
	date: integer("date", { mode: "timestamp" }).notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id),
});

export const relations = defineRelations({ user, workout }, (r) => ({
	user: {
		workouts: r.many.workout(),
	},
	workout: {
		user: r.one.user({
			from: r.workout.userId,
			to: r.user.id,
		}),
	},
}));

export type User = InferSelectModel<typeof user>;
export type Workout = InferSelectModel<typeof workout>;
