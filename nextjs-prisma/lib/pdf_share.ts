import jsPDF from "jspdf"
import { uploadFiles } from "@/lib/storage"

export interface PDFContent {
  title: string
  summary: string
  translations?: Array<{ language: string; content: string }>
  qnas?: Array<{ question: string; answer: string }>
  createdAt: Date
}
export async function generateSummaryPDF(content: PDFContent): Promise<string> {
  try {
    console.log("📄 Generating PDF export...")

 
    const doc = new jsPDF()

    doc.setFont("helvetica")

    let yPosition = 20

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(content.title || "Summary", 20, yPosition)
    yPosition += 15

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Generated on: ${content.createdAt.toLocaleDateString()}`,
      20,
      yPosition
    )
    yPosition += 15

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Summary", 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    const summaryLines = doc.splitTextToSize(content.summary, 170)
    doc.text(summaryLines, 20, yPosition)
    yPosition += summaryLines.length * 7 + 10

    if (content.translations && content.translations.length > 0) {
 
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Translations", 20, yPosition)
      yPosition += 10

      content.translations.forEach((translation) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text(translation.language, 20, yPosition)
        yPosition += 7

        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        const translationLines = doc.splitTextToSize(translation.content, 170)
        doc.text(translationLines, 20, yPosition)
        yPosition += translationLines.length * 7 + 10
      })
    }

    if (content.qnas && content.qnas.length > 0) {
    
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Questions & Answers", 20, yPosition)
      yPosition += 10

      content.qnas.forEach((qna, index) => {
        if (yPosition > 260) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(`Q${index + 1}: ${qna.question}`, 20, yPosition)
        yPosition += 7

        doc.setFont("helvetica", "normal")
        const answerLines = doc.splitTextToSize(`A: ${qna.answer}`, 170)
        doc.text(answerLines, 20, yPosition)
        yPosition += answerLines.length * 7 + 10
      })
    }

  
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    console.log("PDF generated, size:", pdfBuffer.length, "bytes")


    const fileName = `summary-export-${Date.now()}.pdf`
    const pdfUrl = await uploadFiles(pdfBuffer, fileName, "uploads/pdf-exports")

    console.log("✅ PDF uploaded:", pdfUrl)

    return pdfUrl

  } catch (error) {
    console.error("❌ PDF generation error:", error)
    throw new Error(`Failed to generate PDF: ${(error as Error).message}`)
  }
}