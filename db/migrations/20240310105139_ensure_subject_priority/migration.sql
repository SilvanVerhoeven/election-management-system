/*
  Warnings:

  - Added the required column `priority` to the `SubjectOccupancy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubjectOccupancy" (
    "enrolmentId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("enrolmentId", "subjectId", "deleted", "versionId"),
    CONSTRAINT "SubjectOccupancy_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubjectOccupancy" ("deleted", "enrolmentId", "subjectId", "versionId") SELECT "deleted", "enrolmentId", "subjectId", "versionId" FROM "SubjectOccupancy";
DROP TABLE "SubjectOccupancy";
ALTER TABLE "new_SubjectOccupancy" RENAME TO "SubjectOccupancy";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
