-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "businessNumber" TEXT NOT NULL,
    "representativeName" TEXT NOT NULL,
    "address" TEXT,
    "businessType" TEXT,
    "businessItem" TEXT,
    "creditRating" TEXT,
    "riskRating" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
