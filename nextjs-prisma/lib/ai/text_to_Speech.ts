import * as googleTTS from 'google-tts-api';
import { uploadFiles } from "@/lib/storage";

export async function textToSpeech(text: string): Promise<string> {
  try {
    console.log("🎧 Generating audio summary (Free Version)...");
    console.log("Text length:", text.length, "characters");
    console.log("Calling Google TTS API...");

    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
      splitPunct: ',.?!',
    });

    console.log(`Received ${results.length} audio chunks. Stitching...`);

    const combinedBase64 = results.map(result => result.base64).join('');

    const buffer = Buffer.from(combinedBase64, 'base64');

    console.log("Audio stitched. Size:", buffer.length, "bytes");

    const fileName = `summary-audio-${Date.now()}.mp3`;
    
    const audioUrl = await uploadFiles(buffer, fileName, "uploads/audio-summaries");

    console.log("✅ Audio uploaded:", audioUrl);

    return audioUrl;

  } catch (error) {
    console.error("❌ Text-to-speech error:", error);
    throw new Error(`Failed to generate audio: ${(error as Error).message}`);
  }
}