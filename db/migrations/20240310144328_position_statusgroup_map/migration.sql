-- CreateTable
CREATE TABLE "PositionStatusGroupMap" (
    "position" TEXT NOT NULL,
    "statusGroupId" INTEGER NOT NULL,

    PRIMARY KEY ("position", "statusGroupId")
);
