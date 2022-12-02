-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    
    "date" DATETIME NOT NULL,
    "user" TEXT NOT NULL
);
INSERT INTO "new_Workout" ("date", "description", "id", "updatedAt", "user", "value") SELECT "date", "description", "id", "updatedAt", "user", "value" FROM "Workout";
DROP TABLE "Workout";
ALTER TABLE "new_Workout" RENAME TO "Workout";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
