import axios from "axios"

const pdf = require("pdf-parse")

export async function extractTextfromPDF(fileURL: string): Promise<string> {
    try {
        console.log("Downloading file from:", fileURL);

        const response = await axios.get(fileURL, {
            responseType: "arraybuffer"
        })

        console.log("PDF downloaded, size:", response.data.length, "bytes");
        
        const buffer = Buffer.from(response.data)
        const data = await pdf(buffer)

        console.log("PDF parsed successfully");
        console.log("Pages:", data.numpages);
        console.log("Text length:", data.text.length, "characters");

        if (!data.text || data.text.trim().length === 0) {
            throw new Error("PDF does not contain extractable text (might be scanned images)")
        }
        
        return data.text.trim()
        
    } catch (error) {
        console.error("PDF extraction error:", error);
        throw new Error(`Failed to extract text from PDF: ${(error as Error).message}`)
    }
}