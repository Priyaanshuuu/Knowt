/*
  Warnings:

  - The `status` column on the `Upload` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Translation_summaryId_idx" ON "Translation"("summaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_summaryId_language_key" ON "Translation"("summaryId", "language");
