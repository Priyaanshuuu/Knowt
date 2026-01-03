import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { generateQnA } from "@/lib/ai/qna"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const { summaryId, numQuestions = 5 } = await req.json()

    if (!summaryId) {
      return NextResponse.json(
        { error: "summaryId is required" },
        { status: 400 }
      )
    }

    console.log("=== Q&A GENERATION START ===")
    console.log("Summary ID:", summaryId)
    console.log("Number of questions:", numQuestions)

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


    const existingQnAs = await prisma.qnA.findMany({
      where: { summaryId: summaryId },
    })

    if (existingQnAs.length > 0) {
      console.log("Q&A already exists, returning cached version")
      return NextResponse.json({
        success: true,
        count: existingQnAs.length,
        qnas: existingQnAs,
        cached: true,
      })
    }

    console.log("Generating Q&A pairs...")
   const qnaPairs = await generateQnA(summary.summaryText ?? '', numQuestions);

    const savedQnAs = await Promise.all(
      qnaPairs.map((pair) =>
        prisma.qnA.create({
          data: {
            summaryId: summaryId,
            question: pair.question,
            answer: pair.answer,
          },
        })
      )
    )

    console.log("Q&A pairs saved:", savedQnAs.length)
    console.log("=== Q&A GENERATION COMPLETE ===")

    return NextResponse.json({
      success: true,
      count: savedQnAs.length,
      qnas: savedQnAs,
      cached: false,
    }, { status: 201 })

  } catch (error) {
    console.error("Q&A generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate Q&A" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const summaryId = searchParams.get("summaryId")

    if (!summaryId) {
      return NextResponse.json(
        { error: "summaryId is required" },
        { status: 400 }
      )
    }

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

    const qnas = await prisma.qnA.findMany({
      where: { summaryId: summaryId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({
      success: true,
      count: qnas.length,
      qnas,
    })

  } catch (error) {
    console.error("Fetch Q&A error:", error)
    return NextResponse.json(
      { error: "Failed to fetch Q&A" },
      { status: 500 }
    )
  }
}