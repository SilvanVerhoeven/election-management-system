-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER'
);

-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "handle" TEXT NOT NULL,
    "hashedSessionToken" TEXT,
    "antiCSRFToken" TEXT,
    "publicData" TEXT,
    "privateData" TEXT,
    "userId" INTEGER,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "sentTo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
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
    CONSTRAINT "Candidate_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Candidate_explicitelyVoteAtId_fkey" FOREIGN KEY ("explicitelyVoteAtId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Candidate_worksAtId_fkey" FOREIGN KEY ("worksAtId") REFERENCES "Unit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE TABLE "Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT
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
    "associatedWithId" INTEGER NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    CONSTRAINT "Unit_associatedWithId_fkey" FOREIGN KEY ("associatedWithId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Unit_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Constituency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollingStation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "locatedAtId" INTEGER NOT NULL,
    CONSTRAINT "PollingStation_locatedAtId_fkey" FOREIGN KEY ("locatedAtId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "VotingResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VotingResult_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "order" TEXT NOT NULL,
    "submittedOn" DATETIME NOT NULL,
    "createdOn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidatesForId" INTEGER NOT NULL,
    CONSTRAINT "CandidateList_candidatesForId_fkey" FOREIGN KEY ("candidatesForId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateListPosition" (
    "candidateId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,
    "position" INTEGER,

    PRIMARY KEY ("candidateId", "listId"),
    CONSTRAINT "CandidateListPosition_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
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
CREATE TABLE "Upload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "key" TEXT
);

-- CreateTable
CREATE TABLE "_CandidateToStatusGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CandidateToStatusGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CandidateToStatusGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "StatusGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ConstituencyToElection" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ConstituencyToElection_A_fkey" FOREIGN KEY ("A") REFERENCES "Constituency" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConstituencyToElection_B_fkey" FOREIGN KEY ("B") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ElectionToStatusGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ElectionToStatusGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ElectionToStatusGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "StatusGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_handle_key" ON "Session"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Token_hashedToken_type_key" ON "Token"("hashedToken", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_shortName_key" ON "Subject"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateToStatusGroup_AB_unique" ON "_CandidateToStatusGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateToStatusGroup_B_index" ON "_CandidateToStatusGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConstituencyToElection_AB_unique" ON "_ConstituencyToElection"("A", "B");

-- CreateIndex
CREATE INDEX "_ConstituencyToElection_B_index" ON "_ConstituencyToElection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ElectionToStatusGroup_AB_unique" ON "_ElectionToStatusGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_ElectionToStatusGroup_B_index" ON "_ElectionToStatusGroup"("B");
