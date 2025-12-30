/*
  Warnings:

  - The `status` column on the `Upload` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `language` to the `Summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "language" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "error" TEXT DEFAULT '',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
