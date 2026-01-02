import Groq from "groq-sdk";

const groq = new Groq({
    apiKey : process.env.GROG_API_KEY!
})

export async function translateText(
    text : string,
    targetLanguage : string
): Promise<string> {
  try {
    console.log(`Translating to ${targetLanguage}`);
    
    const maxLength = 30000
    const truncatedText = text.length > maxLength
      ? text.substring(0 , maxLength) + "..." : text

    const prompt = `Translate the following text to ${targetLanguage}. Maintain the same tone and meaning. Only return the translated text, nothing else. Text to translate: ${truncatedText} Translation:`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate accurately while preserving the original meaning and tone.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const translation = completion.choices[0]?.message?.content
    if(!translation){
        throw new Error("No translation generated!")
    }

    console.log("Translation Completed!");
    return translation.trim()

  } catch (error) {
    console.error("Translation error:", error);
    const err = error as { status?: number } & Error;
    
    if (err.status === 401) {
      throw new Error("Invalid Groq API key. Check your GROQ_API_KEY in .env");
    }
    
    if (err.status === 429) {
      throw new Error("Groq rate limit exceeded. Wait a minute and try again.");
    }

    throw new Error(`Failed to translate: ${err.message}`);
  }
}   
    
export const SUPPORTED_LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Turkish",
  "Polish",
  "Ukrainian",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Malay",
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]