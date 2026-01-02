import axios from "axios";
import pdf from "pdf-parse-new";

export async function extractTextfromPDF(fileURL: string): Promise<string> {
  try {
    console.log("Downloading PDF from:", fileURL);

    const response = await axios.get(fileURL, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    console.log("PDF downloaded successfully. Size:", response.data.length);

    const pdfBuffer = Buffer.from(response.data);

    console.log("Parsing PDF structure...");

    const data = await pdf(pdfBuffer);

    const rawText = data.text;
    
    const cleanText = rawText
      .replace(/\n\s*\n/g, "\n")
      .trim();

    if (!cleanText || cleanText.length === 0) {
      throw new Error(
        "PDF parsed but returned empty text. This is likely a scanned image PDF (requires OCR)."
      );
    }

    console.log("Extraction complete. Length:", cleanText.length);
    
    return cleanText;

  } catch (error) {
    console.error("PDF Extraction Error:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") throw new Error("PDF download timed out.");
      if (error.response?.status === 404) throw new Error("PDF file not found.");
      if (error.response?.status === 403) throw new Error("Access denied to PDF.");
    }

    throw new Error( "Failed to parse PDF content.");
  }
}