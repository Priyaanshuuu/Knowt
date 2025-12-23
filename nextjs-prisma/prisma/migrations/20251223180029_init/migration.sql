-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('PDF', 'VIDEO', 'AUDIO', 'LINK');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "originalUrl" TEXT,
    "summaryText" TEXT,
    "outputLang" TEXT,
    "audioUrl" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadId" TEXT
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UploadType" NOT NULL,
    "source" TEXT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Share" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Summary_id_key" ON "Summary"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Share_slug_key" ON "Share"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Share_summaryId_key" ON "Share"("summaryId");

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
