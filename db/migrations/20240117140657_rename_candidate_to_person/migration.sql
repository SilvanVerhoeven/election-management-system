/*
  Warnings:

  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `candidateId` on the `VotingResult` table. All the data in the column will be lost.
  - The primary key for the `CandidateListPosition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `candidateId` on the `CandidateListPosition` table. All the data in the column will be lost.
  - The primary key for the `StatusGroupMembership` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `candidateId` on the `StatusGroupMembership` table. All the data in the column will be lost.
  - Added the required column `personId` to the `VotingResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `CandidateListPosition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personId` to the `StatusGroupMembership` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Candidate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Person" (
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
    "subjectId" INTEGER,
    "explicitelyVoteAtId" INTEGER,
    "worksAtId" INTEGER,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Person_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VotingResult" (
    "globalId" INTEGER NOT NULL,
    "numberOfVotes" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "VotingResult_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VotingResult" ("electionId", "globalId", "numberOfVotes", "versionId") SELECT "electionId", "globalId", "numberOfVotes", "versionId" FROM "VotingResult";
DROP TABLE "VotingResult";
ALTER TABLE "new_VotingResult" RENAME TO "VotingResult";
CREATE TABLE "new_CandidateListPosition" (
    "personId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,
    "position" INTEGER,

    PRIMARY KEY ("personId", "listId")
);
INSERT INTO "new_CandidateListPosition" ("listId", "position") SELECT "listId", "position" FROM "CandidateListPosition";
DROP TABLE "CandidateListPosition";
ALTER TABLE "new_CandidateListPosition" RENAME TO "CandidateListPosition";
CREATE TABLE "new_StatusGroupMembership" (
    "personId" INTEGER NOT NULL,
    "statusGroupId" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("personId", "statusGroupId", "versionId"),
    CONSTRAINT "StatusGroupMembership_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StatusGroupMembership" ("deleted", "statusGroupId", "versionId") SELECT "deleted", "statusGroupId", "versionId" FROM "StatusGroupMembership";
DROP TABLE "StatusGroupMembership";
ALTER TABLE "new_StatusGroupMembership" RENAME TO "StatusGroupMembership";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
