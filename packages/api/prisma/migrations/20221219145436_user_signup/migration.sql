CREATE TABLE "new_User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "apiKey" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "displayEmail" TEXT NOT NULL,
  "hashedPassword" TEXT NOT NULL
);

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
