/*
  Warnings:

  - You are about to drop the `Elections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Elections";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ElectionSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "ElectionSet_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Election" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numberOfSeats" INTEGER NOT NULL,
    "committeeId" INTEGER NOT NULL,
    "runsAtId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Election_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Election_runsAtId_fkey" FOREIGN KEY ("runsAtId") REFERENCES "ElectionSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Election_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Election" ("committeeId", "id", "numberOfSeats", "runsAtId", "versionId") SELECT "committeeId", "id", "numberOfSeats", "runsAtId", "versionId" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
