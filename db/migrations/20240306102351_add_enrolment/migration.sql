/*
  Warnings:

  - You are about to drop the column `accountingUnit_1` on the `Employment` table. All the data in the column will be lost.
  - You are about to drop the column `accountingUnit_2` on the `Employment` table. All the data in the column will be lost.
  - The primary key for the `SubjectOccupancy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `personId` on the `SubjectOccupancy` table. All the data in the column will be lost.
  - You are about to drop the column `explicitelyVoteAtId` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `matriculationNumber` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `worksAtId` on the `Person` table. All the data in the column will be lost.
  - Added the required column `accountingUnitId` to the `Employment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employedAtId` to the `Employment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrolmentId` to the `SubjectOccupancy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Enrolment" (
    "globalId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "matriculationNumber" TEXT NOT NULL,
    "explicitelyVoteAtId" INTEGER,
    "deleted" BOOLEAN NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Enrolment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employment" (
    "globalId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "accountingUnitId" TEXT NOT NULL,
    "employedAtId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Employment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employment" ("deleted", "globalId", "personId", "position", "versionId") SELECT "deleted", "globalId", "personId", "position", "versionId" FROM "Employment";
DROP TABLE "Employment";
ALTER TABLE "new_Employment" RENAME TO "Employment";
CREATE TABLE "new_SubjectOccupancy" (
    "enrolmentId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("enrolmentId", "subjectId", "deleted"),
    CONSTRAINT "SubjectOccupancy_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubjectOccupancy" ("deleted", "subjectId", "versionId") SELECT "deleted", "subjectId", "versionId" FROM "SubjectOccupancy";
DROP TABLE "SubjectOccupancy";
ALTER TABLE "new_SubjectOccupancy" RENAME TO "SubjectOccupancy";
CREATE TABLE "new_Unit" (
    "globalId" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
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
INSERT INTO "new_Unit" ("assignedToId", "associatedWithId", "description", "externalId", "globalId", "name", "shortName", "type", "versionId") SELECT "assignedToId", "associatedWithId", "description", "externalId", "globalId", "name", "shortName", "type", "versionId" FROM "Unit";
DROP TABLE "Unit";
ALTER TABLE "new_Unit" RENAME TO "Unit";
CREATE TABLE "new_Person" (
    "globalId" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT,
    "comment" TEXT,
    "electabilityVerifiedOn" DATETIME,
    "isElectionHelper" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Person_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Person" ("comment", "createdAt", "electabilityVerifiedOn", "email", "externalId", "firstName", "globalId", "isElectionHelper", "lastName", "status", "versionId") SELECT "comment", "createdAt", "electabilityVerifiedOn", "email", "externalId", "firstName", "globalId", "isElectionHelper", "lastName", "status", "versionId" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
