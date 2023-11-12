-- CreateTable
CREATE TABLE "Person" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "electabilityVerifiedOn" DATETIME NOT NULL,
    "isElectionHelper" BOOLEAN NOT NULL,
    "matriculationNumber" TEXT,
    "subjectId" INTEGER,
    "explicitelyVoteAtId" INTEGER,
    "worksAtId" INTEGER,
    CONSTRAINT "Person_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Person_explicitelyVoteAtId_fkey" FOREIGN KEY ("explicitelyVoteAtId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Person_worksAtId_fkey" FOREIGN KEY ("worksAtId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "belongsToId" INTEGER NOT NULL,
    CONSTRAINT "Subject_belongsToId_fkey" FOREIGN KEY ("belongsToId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT
);

-- CreateTable
CREATE TABLE "Constituency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "presenceVotingAtId" INTEGER NOT NULL,
    CONSTRAINT "Constituency_presenceVotingAtId_fkey" FOREIGN KEY ("presenceVotingAtId") REFERENCES "PollingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "campusId" INTEGER NOT NULL,
    "constituencyId" INTEGER NOT NULL,
    CONSTRAINT "Unit_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollingStation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "locatedAtId" INTEGER NOT NULL,
    CONSTRAINT "PollingStation_locatedAtId_fkey" FOREIGN KEY ("locatedAtId") REFERENCES "Campus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StatusGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "priority" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "VotingResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numberOfVotes" INTEGER NOT NULL,
    "electionId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    CONSTRAINT "VotingResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VotingResult_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "order" TEXT NOT NULL,
    "submittedOn" DATETIME NOT NULL,
    "candidatesForId" INTEGER NOT NULL,
    CONSTRAINT "CandidateList_candidatesForId_fkey" FOREIGN KEY ("candidatesForId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateListPosition" (
    "candidateId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,
    "position" INTEGER,

    PRIMARY KEY ("candidateId", "listId"),
    CONSTRAINT "CandidateListPosition_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CandidateListPosition_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CandidateList" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Election" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "numberOfSeats" INTEGER NOT NULL,
    "committeeId" INTEGER NOT NULL,
    "runsAtId" INTEGER,
    CONSTRAINT "Election_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Election_runsAtId_fkey" FOREIGN KEY ("runsAtId") REFERENCES "Elections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Committee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "numberOfSeats" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Elections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PersonToStatusGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PersonToStatusGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PersonToStatusGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "StatusGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ElectionToStatusGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ElectionToStatusGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ElectionToStatusGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "StatusGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_PersonToStatusGroup_AB_unique" ON "_PersonToStatusGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_PersonToStatusGroup_B_index" ON "_PersonToStatusGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ElectionToStatusGroup_AB_unique" ON "_ElectionToStatusGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_ElectionToStatusGroup_B_index" ON "_ElectionToStatusGroup"("B");
