import {pdf} from "pdf-parse"
import axios from "axios"

export async function extractTextfromPDF(fileURL : string){
 
    try {
        console.log("Downloading file from:" , fileURL);

        const response = await axios.get(fileURL , {
            responseType : "arraybuffer"
        })

        console.log("PDF dowmloaded , size:" , response.data.length , "bytes");
        
        const buffer = Buffer.from(response.data)

        const data = await pdf(buffer)

        console.log("PDF parsed successfully");
        console.log("Pages:" , data.numpages);
        console.log("Text length:" , data.Text.length, "characters");

        if(!data.Text || data.Text.trim().length === 0){
            throw new Error("PDF do not contain extractable text (might be scanned images)")
        }
        
        return data.text
        
    } catch (error) {
        console.log("PDF extraction error :" , error);
        throw new Error(`Failed to extract text from the PDF: ${(error as Error).message}`)
        
        
    }
}