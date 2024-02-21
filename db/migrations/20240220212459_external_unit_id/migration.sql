/*
  Warnings:

  - Added the required column `externalId` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Unit" (
    "globalId" INTEGER NOT NULL,
    "externalId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "associatedWithId" INTEGER NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Unit_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Unit" ("assignedToId", "associatedWithId", "description", "globalId", "name", "shortName", "type", "versionId") SELECT "assignedToId", "associatedWithId", "description", "globalId", "name", "shortName", "type", "versionId" FROM "Unit";
DROP TABLE "Unit";
ALTER TABLE "new_Unit" RENAME TO "Unit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
