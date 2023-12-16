/*
  Warnings:

  - You are about to drop the column `numberOfSeats` on the `Committee` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Committee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Committee_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Committee" ("id", "name", "shortName", "versionId") SELECT "id", "name", "shortName", "versionId" FROM "Committee";
DROP TABLE "Committee";
ALTER TABLE "new_Committee" RENAME TO "Committee";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
