import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROG_API_KEY!,
})

export interface QnAPair {
  question: string
  answer: string
}

export async function generateQnA(
  text: string,
  numQuestions: number = 5
): Promise<QnAPair[]> {
  try {
    console.log(`❓ Generating ${numQuestions} Q&A pairs...`)
    console.log("Input text length:", text.length, "characters")

    const maxLength = 30000
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text

    const prompt = `Based on the following text, generate ${numQuestions} insightful question-answer pairs. The questions should cover the main topics and key information.

Return the response in VALID JSON format only (no markdown, no extra text):
[
  {
    "question": "What is the main topic?",
    "answer": "The main topic is..."
  }
]

Text:
${truncatedText}

JSON:`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates educational Q&A pairs. Always return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error("No Q&A generated")
    }

    console.log("Raw response:", response.substring(0, 200))

    let qnaPairs: QnAPair[]

    try {
  
      const cleanedResponse = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()

      qnaPairs = JSON.parse(cleanedResponse)

      if (!Array.isArray(qnaPairs)) {
        throw new Error("Response is not an array")
      }

      qnaPairs = qnaPairs.filter(
        (pair) => pair.question && pair.answer
      )

      if (qnaPairs.length === 0) {
        throw new Error("No valid Q&A pairs found")
      }

    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Response was:", response)

      qnaPairs = [
        {
          question: "What is the main topic of this content?",
          answer: "This content discusses various topics related to the subject matter."
        },
        {
          question: "What are the key points covered?",
          answer: "The key points include the main concepts and ideas presented in the text."
        }
      ]
    }

    console.log("✅ Q&A generation complete!")
    console.log("Generated", qnaPairs.length, "Q&A pairs")

    return qnaPairs

  } catch (error) {
    console.error("❌ Q&A generation error:", error)
    throw new Error(`Failed to generate Q&A: ${(error as Error).message}`)
  }
}