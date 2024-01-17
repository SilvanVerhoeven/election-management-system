/*
  Warnings:

  - The primary key for the `ConstituencyEligibility` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StatusGroupMembership` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StatusGroupEligibility` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConstituencyEligibility" (
    "constituencyId" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("electionId", "constituencyId", "deleted"),
    CONSTRAINT "ConstituencyEligibility_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConstituencyEligibility" ("constituencyId", "deleted", "electionId", "versionId") SELECT "constituencyId", "deleted", "electionId", "versionId" FROM "ConstituencyEligibility";
DROP TABLE "ConstituencyEligibility";
ALTER TABLE "new_ConstituencyEligibility" RENAME TO "ConstituencyEligibility";
CREATE TABLE "new_StatusGroupMembership" (
    "personId" INTEGER NOT NULL,
    "statusGroupId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("personId", "statusGroupId", "deleted"),
    CONSTRAINT "StatusGroupMembership_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StatusGroupMembership" ("deleted", "personId", "statusGroupId", "versionId") SELECT "deleted", "personId", "statusGroupId", "versionId" FROM "StatusGroupMembership";
DROP TABLE "StatusGroupMembership";
ALTER TABLE "new_StatusGroupMembership" RENAME TO "StatusGroupMembership";
CREATE TABLE "new_StatusGroupEligibility" (
    "statusGroupId" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("electionId", "statusGroupId", "deleted"),
    CONSTRAINT "StatusGroupEligibility_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StatusGroupEligibility" ("deleted", "electionId", "statusGroupId", "versionId") SELECT "deleted", "electionId", "statusGroupId", "versionId" FROM "StatusGroupEligibility";
DROP TABLE "StatusGroupEligibility";
ALTER TABLE "new_StatusGroupEligibility" RENAME TO "StatusGroupEligibility";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;