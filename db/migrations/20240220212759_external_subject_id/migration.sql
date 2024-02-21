/*
  Warnings:

  - Added the required column `externalId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subject" (
    "globalId" INTEGER NOT NULL,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "belongsToId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Subject_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subject" ("belongsToId", "globalId", "name", "shortName", "versionId") SELECT "belongsToId", "globalId", "name", "shortName", "versionId" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
CREATE UNIQUE INDEX "Subject_shortName_key" ON "Subject"("shortName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
