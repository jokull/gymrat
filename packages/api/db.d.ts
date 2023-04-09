import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;
export type User = {
    id: Generated<string>;
    apiKey: string;
    email: string;
    displayEmail: string;
    hashedPassword: string;
};
export type Workout = {
    id: Generated<string>;
    updatedAt: string;
    description: string;
    value: string;
    numberValue: Generated<number>;
    isTime: Generated<number>;
    date: string;
    userId: string;
};
export type DB = {
    User: User;
    Workout: Workout;
};
