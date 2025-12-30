import OpenAI from "openai";
import axios from "axios";
import fs from "fs"
import path from "path";
import { promisify } from "util";
import os from "os"  // Add this import

const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)
const openai = new OpenAI({
    apiKey : process.env.OPENAI_API_KEY
})

export async function transcribeAudio(audioUrl:string) {
    let tempFilePath: string | undefined

try {
    console.log("Downloading audio from:" , audioUrl);

    const response = await axios.get(audioUrl , {
        responseType : "arraybuffer"
    })

    console.log("Audio Downloaded, size:" , response.data.length , "bytes");

    const fileExtension = audioUrl.split(".").pop()?.split("?")[0] || "mp3"

    // Use os.tmpdir() instead of "/tmp" for cross-platform compatibility
    tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.${fileExtension}`)
    await writeFile(tempFilePath , response.data)

    console.log("Audio saved to temp file" , tempFilePath);

    console.log("Transcribinn audio with Whisper...");
    const transcription = await openai.audio.transcriptions.create({
        file : fs.createReadStream(tempFilePath),
        model : "whisper-1",
        language: "en"
    })

    console.log("Transcription Complete");
    console.log("Transcripted text length" , transcription.text.length , "characters");

    return transcription.text
    
} catch (error) {
    console.log("Audio transcription error:" , error);
    throw new Error(`Failed to transcribe audio: ${(error as Error).message}`)    
} finally {
    if(tempFilePath){
        try {
            await unlink(tempFilePath)
            console.log("Temp file deleted");
            
        } catch (error) {
            console.log("Failed to delete temp file" , error);
        }
    }
}
    
}