-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Committee" (
    "globalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "electionsGroupedBy" TEXT NOT NULL DEFAULT 'C',
    "versionId" INTEGER NOT NULL,

    PRIMARY KEY ("globalId", "versionId"),
    CONSTRAINT "Committee_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Committee" ("globalId", "name", "shortName", "versionId") SELECT "globalId", "name", "shortName", "versionId" FROM "Committee";
DROP TABLE "Committee";
ALTER TABLE "new_Committee" RENAME TO "Committee";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
