import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { textToSpeech } from "@/lib/ai/text_to_Speech" 

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const { summaryId } = await req.json()

    if (!summaryId) {
      return NextResponse.json(
        { error: "summaryId is required" },
        { status: 400 }
      )
    }

    console.log("=== AUDIO SUMMARY GENERATION START ===")
    console.log("Summary ID:", summaryId)

    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
    })

    if (!summary) {
      return NextResponse.json(
        { error: "Summary not found" },
        { status: 404 }
      )
    }

 
    if (summary.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

  
    if (!summary.summaryText || summary.summaryText.trim().length === 0) {
      return NextResponse.json(
        { error: "Summary has no text content to convert to audio" },
        { status: 400 }
      )
    }

    if (summary.audioUrl) {
      console.log("Audio already exists, returning cached version")
      return NextResponse.json({
        success: true,
        audioUrl: summary.audioUrl,
        cached: true,
      })
    }

    console.log("Generating audio summary...")

    const audioUrl = await textToSpeech(summary.summaryText)
    const updatedSummary = await prisma.summary.update({
      where: { id: summaryId },
      data: { audioUrl: audioUrl },
    })

    console.log("Audio URL saved to database:", audioUrl)
    console.log("=== AUDIO SUMMARY GENERATION COMPLETE ===")

    return NextResponse.json({
      success: true,
      audioUrl: updatedSummary.audioUrl,
      cached: false,
    }, { status: 201 })

  } catch (error) {
    console.error("Audio summary generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate audio summary" },
      { status: 500 }
    )
  }
}