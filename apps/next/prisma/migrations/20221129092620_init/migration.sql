-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "user" TEXT NOT NULL
);
