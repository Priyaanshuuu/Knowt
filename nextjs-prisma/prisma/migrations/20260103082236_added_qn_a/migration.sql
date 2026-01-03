-- CreateTable
CREATE TABLE "QnA" (
    "id" SERIAL NOT NULL,
    "summaryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QnA_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QnA" ADD CONSTRAINT "QnA_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
