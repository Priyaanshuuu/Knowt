import axios from "axios"

export async function extractTextfromPDF(fileURL: string): Promise<string> {
  try {
    console.log("Downloading PDF from:", fileURL)

    const response = await axios.get(fileURL, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 second timeout
    })

    console.log("PDF downloaded successfully, size:", response.data.length, "bytes")

  
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js")
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
    

    pdfjsLib.GlobalWorkerOptions.workerSrc = ""

    const pdfData = new Uint8Array(response.data)

    console.log("Loading PDF document...")

    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    })

    const pdfDocument = await loadingTask.promise

    console.log("PDF loaded successfully!")
    console.log("Number of pages:", pdfDocument.numPages)

    // Extract text from all pages
    let fullText = ""
    let successfulPages = 0

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      try {
        console.log(`Extracting text from page ${pageNum}/${pdfDocument.numPages}...`)

        const page = await pdfDocument.getPage(pageNum)
        const textContent = await page.getTextContent()

        // Get all text items and join them
        const pageText = textContent.items
          .map((item) => {
            if (typeof item === "string") return item
            return item.str || ""
          })
          .filter((text: string) => text.trim().length > 0)
          .join(" ")

        if (pageText.trim()) {
          fullText += pageText + "\n\n"
          successfulPages++
        }

      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError)
      }
    }

    console.log("Text extraction complete!")
    console.log("Successfully extracted from", successfulPages, "pages")
    console.log("Total text length:", fullText.length, "characters")

    const trimmedText = fullText.trim()

    if (!trimmedText || trimmedText.length === 0) {
      throw new Error(
        "PDF does not contain extractable text. This might be a scanned image PDF. " +
        "Please use a PDF with selectable text, or use OCR software first."
      )
    }

    if (trimmedText.length < 50) {
      console.warn("Warning: Very little text extracted from PDF")
    }

    return trimmedText

  } catch (error) {
    console.error("PDF extraction error:", error)

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("PDF download timeout - file might be too large")
      }
      if (error.response?.status === 404) {
        throw new Error("PDF file not found at the provided URL")
      }
      if (error.response?.status === 403) {
        throw new Error("Access denied to PDF file")
      }
    }

    throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`)
  }
}