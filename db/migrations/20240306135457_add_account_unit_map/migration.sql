-- CreateTable
CREATE TABLE "AccountUnitMap" (
    "accountingUnitId" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,

    PRIMARY KEY ("accountingUnitId", "unitId")
);
