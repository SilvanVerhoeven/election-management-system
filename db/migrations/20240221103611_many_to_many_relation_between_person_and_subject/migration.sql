/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Person` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SubjectOccupancy" (
    "personId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("personId", "subjectId", "deleted"),
    CONSTRAINT "SubjectOccupancy_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "globalId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT,
    "comment" TEXT,
    "electabilityVerifiedOn" DATETIME,
    "isElectionHelper" BOOLEAN,
    "matriculationNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "explicitelyVoteAtId" INTEGER,
    "worksAtId" INTEGER,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Person_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Person" ("comment", "createdAt", "electabilityVerifiedOn", "email", "explicitelyVoteAtId", "firstName", "globalId", "isElectionHelper", "lastName", "matriculationNumber", "status", "versionId", "worksAtId") SELECT "comment", "createdAt", "electabilityVerifiedOn", "email", "explicitelyVoteAtId", "firstName", "globalId", "isElectionHelper", "lastName", "matriculationNumber", "status", "versionId", "worksAtId" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
