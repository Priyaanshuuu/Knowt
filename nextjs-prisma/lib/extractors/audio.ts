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
    const response = await axios.get(fileURL, {
      responseType: "arraybuffer",
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    console.log("Download complete. Size:", response.data.length, "bytes");
    const urlPath = new URL(fileURL).pathname;
    const ext = path.extname(urlPath) || ".mp3";
    const tempDir = os.tmpdir();
    const fileName = `audio-${Date.now()}${ext}`;
    tempFilePath = path.join(tempDir, fileName);

    fs.writeFileSync(tempFilePath, Buffer.from(response.data));
    console.log("Saved to temp file:", tempFilePath);

    console.log("Sending to Groq for transcription...");
    
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
      response_format: "json",
    });

    const text = transcription.text;

    if (!text) {
      throw new Error("Groq returned empty transcription");
    }

    console.log("Transcription successful!");
    return text;

  } catch (error) {
    console.error("Audio Transcription Failed:");
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') throw new Error("Download timed out (file might be too big or slow connection)");
      if (error.response?.status === 403) throw new Error("Access denied (403). The file link might be private.");
    }
    
    throw error;
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("Temp file cleaned up.");
      } catch (e) {
        console.error("Cleanup warning:", e);
      }
    }
  }
}