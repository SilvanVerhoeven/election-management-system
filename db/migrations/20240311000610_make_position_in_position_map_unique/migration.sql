/*
  Warnings:

  - The primary key for the `PositionStatusGroupMap` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PositionStatusGroupMap" (
    "position" TEXT NOT NULL,
    "statusGroupId" INTEGER
);
INSERT INTO "new_PositionStatusGroupMap" ("position", "statusGroupId") SELECT "position", "statusGroupId" FROM "PositionStatusGroupMap";
DROP TABLE "PositionStatusGroupMap";
ALTER TABLE "new_PositionStatusGroupMap" RENAME TO "PositionStatusGroupMap";
CREATE UNIQUE INDEX "PositionStatusGroupMap_position_key" ON "PositionStatusGroupMap"("position");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
