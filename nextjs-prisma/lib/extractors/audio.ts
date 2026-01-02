import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROG_API_KEY,
});

export async function transcribeAudio(fileURL: string): Promise<string> {
  let tempFilePath: string | null = null;

  try {
    console.log("Downloading Audio from:", fileURL);

    const urlPath = new URL(fileURL).pathname;
    const ext = path.extname(urlPath) || ".mp3";
    
    const tempDir = os.tmpdir();
    const fileName = `audio-${Date.now()}${ext}`;
    tempFilePath = path.join(tempDir, fileName);

    const response = await axios.get(fileURL, { responseType: "stream" });
    const writer = fs.createWriteStream(tempFilePath);

    response.data.pipe(writer);

    await new Promise((resolve , reject) => {
      writer.on("finish", ()=> resolve);
      writer.on("error", (error) => reject(error));
    });

    console.log("Audio downloaded to temp file:", tempFilePath);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "distil-whisper-large-v3-en", 
      response_format: "json",
    });

    const text = transcription.text;

    if (!text || text.trim().length === 0) {
      throw new Error("Audio transcribed but returned empty text.");
    }

    console.log("Transcription complete. Length:", text.length);

    return text;

  } catch (error) {
    console.error("Audio Transcription Error:", error);
    throw new Error(`Failed to transcribe audio:`);
  } finally {
 
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("Temp audio file cleaned up");
      } catch (cleanupError) {
        console.warn("Failed to delete temp file:", cleanupError);
      }
    }
  }
}