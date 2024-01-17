/*
  Warnings:

  - You are about to drop the `_CandidateToStatusGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ConstituencyToElection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ElectionToStatusGroup` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Committee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Committee` table. All the data in the column will be lost.
  - The primary key for the `Site` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Site` table. All the data in the column will be lost.
  - The primary key for the `StatusGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StatusGroup` table. All the data in the column will be lost.
  - The primary key for the `Subject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Subject` table. All the data in the column will be lost.
  - The primary key for the `Constituency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Constituency` table. All the data in the column will be lost.
  - The primary key for the `Election` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Election` table. All the data in the column will be lost.
  - The primary key for the `PollingStation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PollingStation` table. All the data in the column will be lost.
  - The primary key for the `Candidate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Candidate` table. All the data in the column will be lost.
  - The primary key for the `Unit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Unit` table. All the data in the column will be lost.
  - The primary key for the `ElectionSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ElectionSet` table. All the data in the column will be lost.
  - The primary key for the `VotingResult` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `VotingResult` table. All the data in the column will be lost.
  - The primary key for the `CandidateList` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CandidateList` table. All the data in the column will be lost.
  - Added the required column `globalId` to the `Committee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `StatusGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `Constituency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `Election` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `PollingStation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `Unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `ElectionSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `VotingResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalId` to the `CandidateList` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_CandidateToStatusGroup_B_index";

-- DropIndex
DROP INDEX "_CandidateToStatusGroup_AB_unique";

-- DropIndex
DROP INDEX "_ConstituencyToElection_B_index";

-- DropIndex
DROP INDEX "_ConstituencyToElection_AB_unique";

-- DropIndex
DROP INDEX "_ElectionToStatusGroup_B_index";

-- DropIndex
DROP INDEX "_ElectionToStatusGroup_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CandidateToStatusGroup";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ConstituencyToElection";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ElectionToStatusGroup";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "StatusGroupMembership" (
    "candidateId" INTEGER NOT NULL,
    "statusGroupId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("candidateId", "statusGroupId", "versionId"),
    CONSTRAINT "StatusGroupMembership_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusGroupEligibility" (
    "statusGroupId" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("electionId", "statusGroupId", "versionId"),
    CONSTRAINT "StatusGroupEligibility_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConstituencyEligibility" (
    "constituencyId" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("electionId", "constituencyId", "versionId"),
    CONSTRAINT "ConstituencyEligibility_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Version" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Committee" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Committee_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Committee" ("name", "shortName", "versionId") SELECT "name", "shortName", "versionId" FROM "Committee";
DROP TABLE "Committee";
ALTER TABLE "new_Committee" RENAME TO "Committee";
CREATE TABLE "new_Site" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Site_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("description", "name", "shortName", "versionId") SELECT "description", "name", "shortName", "versionId" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE TABLE "new_StatusGroup" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "priority" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "StatusGroup_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StatusGroup" ("name", "priority", "shortName", "versionId") SELECT "name", "priority", "shortName", "versionId" FROM "StatusGroup";
DROP TABLE "StatusGroup";
ALTER TABLE "new_StatusGroup" RENAME TO "StatusGroup";
CREATE TABLE "new_Subject" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "belongsToId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Subject_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subject" ("belongsToId", "name", "shortName", "versionId") SELECT "belongsToId", "name", "shortName", "versionId" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
CREATE UNIQUE INDEX "Subject_shortName_key" ON "Subject"("shortName");
CREATE TABLE "new_Constituency" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "presenceVotingAtId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Constituency_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Constituency" ("description", "name", "presenceVotingAtId", "shortName", "versionId") SELECT "description", "name", "presenceVotingAtId", "shortName", "versionId" FROM "Constituency";
DROP TABLE "Constituency";
ALTER TABLE "new_Constituency" RENAME TO "Constituency";
CREATE TABLE "new_Election" (
    "globalId" INTEGER NOT NULL,
    "numberOfSeats" INTEGER NOT NULL,
    "committeeId" INTEGER NOT NULL,
    "runsAtId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Election_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Election" ("committeeId", "numberOfSeats", "runsAtId", "versionId") SELECT "committeeId", "numberOfSeats", "runsAtId", "versionId" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
CREATE TABLE "new_PollingStation" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "locatedAtId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "PollingStation_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PollingStation" ("locatedAtId", "name", "shortName", "versionId") SELECT "locatedAtId", "name", "shortName", "versionId" FROM "PollingStation";
DROP TABLE "PollingStation";
ALTER TABLE "new_PollingStation" RENAME TO "PollingStation";
CREATE TABLE "new_Candidate" (
    "globalId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT,
    "comment" TEXT,
    "electabilityVerifiedOn" DATETIME,
    "isElectionHelper" BOOLEAN,
    "matriculationNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subjectId" INTEGER,
    "explicitelyVoteAtId" INTEGER,
    "worksAtId" INTEGER,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Candidate_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Candidate" ("comment", "createdAt", "electabilityVerifiedOn", "email", "explicitelyVoteAtId", "firstName", "isElectionHelper", "lastName", "matriculationNumber", "status", "subjectId", "type", "versionId", "worksAtId") SELECT "comment", "createdAt", "electabilityVerifiedOn", "email", "explicitelyVoteAtId", "firstName", "isElectionHelper", "lastName", "matriculationNumber", "status", "subjectId", "type", "versionId", "worksAtId" FROM "Candidate";
DROP TABLE "Candidate";
ALTER TABLE "new_Candidate" RENAME TO "Candidate";
CREATE TABLE "new_CandidateListPosition" (
    "candidateId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,
    "position" INTEGER,

    PRIMARY KEY ("candidateId", "listId")
);
INSERT INTO "new_CandidateListPosition" ("candidateId", "listId", "position") SELECT "candidateId", "listId", "position" FROM "CandidateListPosition";
DROP TABLE "CandidateListPosition";
ALTER TABLE "new_CandidateListPosition" RENAME TO "CandidateListPosition";
CREATE TABLE "new_Unit" (
    "globalId" INTEGER NOT NULL,
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
INSERT INTO "new_Unit" ("assignedToId", "associatedWithId", "description", "name", "shortName", "type", "versionId") SELECT "assignedToId", "associatedWithId", "description", "name", "shortName", "type", "versionId" FROM "Unit";
DROP TABLE "Unit";
ALTER TABLE "new_Unit" RENAME TO "Unit";
CREATE TABLE "new_ElectionSet" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "ElectionSet_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ElectionSet" ("endDate", "name", "startDate", "versionId") SELECT "endDate", "name", "startDate", "versionId" FROM "ElectionSet";
DROP TABLE "ElectionSet";
ALTER TABLE "new_ElectionSet" RENAME TO "ElectionSet";
CREATE TABLE "new_VotingResult" (
    "globalId" INTEGER NOT NULL,
    "numberOfVotes" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "VotingResult_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VotingResult" ("candidateId", "electionId", "numberOfVotes", "versionId") SELECT "candidateId", "electionId", "numberOfVotes", "versionId" FROM "VotingResult";
DROP TABLE "VotingResult";
ALTER TABLE "new_VotingResult" RENAME TO "VotingResult";
CREATE TABLE "new_CandidateList" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "order" TEXT NOT NULL,
    "submittedOn" DATETIME NOT NULL,
    "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidatesForId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "CandidateList_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CandidateList" ("candidatesForId", "createdOn", "name", "order", "shortName", "submittedOn", "versionId") SELECT "candidatesForId", "createdOn", "name", "order", "shortName", "submittedOn", "versionId" FROM "CandidateList";
DROP TABLE "CandidateList";
ALTER TABLE "new_CandidateList" RENAME TO "CandidateList";
CREATE TABLE "new_Upload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "key" TEXT,
    "versionId" INTEGER,
    CONSTRAINT "Upload_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Upload" ("filename", "id", "key", "type", "uploadedAt") SELECT "filename", "id", "key", "type", "uploadedAt" FROM "Upload";
DROP TABLE "Upload";
ALTER TABLE "new_Upload" RENAME TO "Upload";
CREATE UNIQUE INDEX "Upload_versionId_key" ON "Upload"("versionId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
