/*
  Warnings:

  - Made the column `runsAtId` on table `Election` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Election" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numberOfSeats" INTEGER NOT NULL,
    "committeeId" INTEGER NOT NULL,
    "runsAtId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Election_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Election_runsAtId_fkey" FOREIGN KEY ("runsAtId") REFERENCES "Elections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Election_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Election" ("committeeId", "id", "numberOfSeats", "runsAtId", "versionId") SELECT "committeeId", "id", "numberOfSeats", "runsAtId", "versionId" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
