/*
  Warnings:

  - You are about to drop the column `campusId` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `constituencyId` on the `Unit` table. All the data in the column will be lost.
  - Added the required column `assignedToId` to the `Unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `associatedWithId` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_ConstituencyToElection" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ConstituencyToElection_A_fkey" FOREIGN KEY ("A") REFERENCES "Constituency" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConstituencyToElection_B_fkey" FOREIGN KEY ("B") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "associatedWithId" INTEGER NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    CONSTRAINT "Unit_associatedWithId_fkey" FOREIGN KEY ("associatedWithId") REFERENCES "Campus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Constituency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Unit" ("description", "id", "name", "shortName", "type") SELECT "description", "id", "name", "shortName", "type" FROM "Unit";
DROP TABLE "Unit";
ALTER TABLE "new_Unit" RENAME TO "Unit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_ConstituencyToElection_AB_unique" ON "_ConstituencyToElection"("A", "B");

-- CreateIndex
CREATE INDEX "_ConstituencyToElection_B_index" ON "_ConstituencyToElection"("B");
