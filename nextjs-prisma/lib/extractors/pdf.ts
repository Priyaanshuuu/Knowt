import axios from "axios"
import * as pdfjsLib from "pdfjs-dist"

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function extractTextfromPDF(fileURL: string): Promise<string> {
    try {
        console.log("Downloading file from:", fileURL);

        const response = await axios.get(fileURL, {
            responseType: "arraybuffer"
        })

        console.log("PDF downloaded, size:", response.data.length, "bytes");
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: response.data })
        const pdf = await loadingTask.promise

        console.log("PDF loaded successfully");
        console.log("Pages:", pdf.numPages);

        // Extract text from all pages
        let fullText = ""

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()
            
           const pageText = textContent.items
    .map((item) => {
        if ('str' in item) {
            return item.str;
        } else {
            return '';
        }
    })
    .join(" ");
            
            fullText += pageText + "\n\n"
        }

        console.log("Text extracted successfully");
        console.log("Text length:", fullText.length, "characters");

        if (!fullText || fullText.trim().length === 0) {
            throw new Error("PDF does not contain extractable text (might be scanned images)")
        }
        
        return fullText.trim()
        
    } catch (error) {
        console.error("PDF extraction error:", error);
        throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`)
    }
}