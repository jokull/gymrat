/*
  Warnings:

  - You are about to drop the column `apiKey` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiKey" TEXT NOT NULL DEFAULT ''
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "numberValue" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Workout" ("date", "description", "id", "numberValue", "updatedAt", "value") SELECT "date", "description", "id", "numberValue", "updatedAt", "value" FROM "Workout";
DROP TABLE "Workout";
ALTER TABLE "new_Workout" RENAME TO "Workout";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
