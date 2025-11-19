-- AlterTable
ALTER TABLE "files" ADD COLUMN "originalName" TEXT;
ALTER TABLE "files" ADD COLUMN "status" TEXT;
ALTER TABLE "files" ADD COLUMN "storedName" TEXT;

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileType" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
