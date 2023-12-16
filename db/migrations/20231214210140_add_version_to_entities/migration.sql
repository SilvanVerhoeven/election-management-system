/*
  Warnings:

  - Added the required column `versionId` to the `CandidateList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Constituency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Committee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Election` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `PollingStation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `VotingResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `StatusGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versionId` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CandidateList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "order" TEXT NOT NULL,
    "submittedOn" DATETIME NOT NULL,
    "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidatesForId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "CandidateList_candidatesForId_fkey" FOREIGN KEY ("candidatesForId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CandidateList_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CandidateList" ("candidatesForId", "createdOn", "id", "name", "order", "shortName", "submittedOn") SELECT "candidatesForId", "createdOn", "id", "name", "order", "shortName", "submittedOn" FROM "CandidateList";
DROP TABLE "CandidateList";
ALTER TABLE "new_CandidateList" RENAME TO "CandidateList";
CREATE TABLE "new_Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "belongsToId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Subject_belongsToId_fkey" FOREIGN KEY ("belongsToId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subject_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subject" ("belongsToId", "id", "name", "shortName") SELECT "belongsToId", "id", "name", "shortName" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
CREATE UNIQUE INDEX "Subject_shortName_key" ON "Subject"("shortName");
CREATE TABLE "new_Constituency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "presenceVotingAtId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Constituency_presenceVotingAtId_fkey" FOREIGN KEY ("presenceVotingAtId") REFERENCES "PollingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Constituency_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Constituency" ("description", "id", "name", "presenceVotingAtId", "shortName") SELECT "description", "id", "name", "presenceVotingAtId", "shortName" FROM "Constituency";
DROP TABLE "Constituency";
ALTER TABLE "new_Constituency" RENAME TO "Constituency";
CREATE TABLE "new_Committee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "numberOfSeats" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Committee_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Committee" ("id", "name", "numberOfSeats", "shortName") SELECT "id", "name", "numberOfSeats", "shortName" FROM "Committee";
DROP TABLE "Committee";
ALTER TABLE "new_Committee" RENAME TO "Committee";
CREATE TABLE "new_Election" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "numberOfSeats" INTEGER NOT NULL,
    "committeeId" INTEGER NOT NULL,
    "runsAtId" INTEGER,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Election_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Election_runsAtId_fkey" FOREIGN KEY ("runsAtId") REFERENCES "Elections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Election_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Election" ("committeeId", "id", "numberOfSeats", "runsAtId", "type") SELECT "committeeId", "id", "numberOfSeats", "runsAtId", "type" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
CREATE TABLE "new_Candidate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    CONSTRAINT "Candidate_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Candidate_explicitelyVoteAtId_fkey" FOREIGN KEY ("explicitelyVoteAtId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Candidate_worksAtId_fkey" FOREIGN KEY ("worksAtId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Candidate_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Candidate" ("comment", "createdAt", "electabilityVerifiedOn", "email", "explicitelyVoteAtId", "firstName", "id", "isElectionHelper", "lastName", "matriculationNumber", "status", "subjectId", "type", "worksAtId") SELECT "comment", "createdAt", "electabilityVerifiedOn", "email", "explicitelyVoteAtId", "firstName", "id", "isElectionHelper", "lastName", "matriculationNumber", "status", "subjectId", "type", "worksAtId" FROM "Candidate";
DROP TABLE "Candidate";
ALTER TABLE "new_Candidate" RENAME TO "Candidate";
CREATE TABLE "new_Elections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Elections_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Elections" ("endDate", "id", "name", "startDate") SELECT "endDate", "id", "name", "startDate" FROM "Elections";
DROP TABLE "Elections";
ALTER TABLE "new_Elections" RENAME TO "Elections";
CREATE TABLE "new_Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Site_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("description", "id", "name", "shortName") SELECT "description", "id", "name", "shortName" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE TABLE "new_PollingStation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "locatedAtId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "PollingStation_locatedAtId_fkey" FOREIGN KEY ("locatedAtId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PollingStation_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PollingStation" ("id", "locatedAtId", "name", "shortName") SELECT "id", "locatedAtId", "name", "shortName" FROM "PollingStation";
DROP TABLE "PollingStation";
ALTER TABLE "new_PollingStation" RENAME TO "PollingStation";
CREATE TABLE "new_VotingResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numberOfVotes" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "VotingResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VotingResult_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VotingResult_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VotingResult" ("candidateId", "electionId", "id", "numberOfVotes") SELECT "candidateId", "electionId", "id", "numberOfVotes" FROM "VotingResult";
DROP TABLE "VotingResult";
ALTER TABLE "new_VotingResult" RENAME TO "VotingResult";
CREATE TABLE "new_StatusGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "priority" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "StatusGroup_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StatusGroup" ("id", "name", "priority", "shortName") SELECT "id", "name", "priority", "shortName" FROM "StatusGroup";
DROP TABLE "StatusGroup";
ALTER TABLE "new_StatusGroup" RENAME TO "StatusGroup";
CREATE TABLE "new_Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "associatedWithId" INTEGER NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    "versionId" INTEGER NOT NULL,
    CONSTRAINT "Unit_associatedWithId_fkey" FOREIGN KEY ("associatedWithId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Constituency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Upload" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Unit" ("assignedToId", "associatedWithId", "description", "id", "name", "shortName", "type") SELECT "assignedToId", "associatedWithId", "description", "id", "name", "shortName", "type" FROM "Unit";
DROP TABLE "Unit";
ALTER TABLE "new_Unit" RENAME TO "Unit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
