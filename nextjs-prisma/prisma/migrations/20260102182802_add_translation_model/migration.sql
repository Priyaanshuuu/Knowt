-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
