import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { generateSummaryPDF } from "@/lib/pdf_share"

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

    console.log("=== PDF EXPORT START ===")
    console.log("Summary ID:", summaryId)

  
    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
      include: {
        upload: true,
        translation: true,
        QnA: true,
      },
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

    if (summary.pdfUrl) {
      console.log("PDF already exists, returning cached version")
      return NextResponse.json({
        success: true,
        pdfUrl: summary.pdfUrl,
        cached: true,
      })
    }
    console.log("Generating PDF export...")
    const pdfUrl = await generateSummaryPDF({
      title: summary.upload?.source ?? "Summary",
      summary: summary.summaryText || "",
      translations: summary.translation ?? [],
      qnas: summary.QnA ?? [],
      createdAt: summary.createdAt,
    })

    const updatedSummary = await prisma.summary.update({
      where: { id: summaryId },
      data: { pdfUrl: pdfUrl },
    })

    console.log("PDF URL saved to database")
    console.log("=== PDF EXPORT COMPLETE ===")

    return NextResponse.json({
      success: true,
      pdfUrl: updatedSummary.pdfUrl,
      cached: false,
    }, { status: 201 })

  } catch (error) {
    console.error("PDF export error:", error)
    return NextResponse.json(
      { error: "Failed to export PDF" },
      { status: 500 }
    )
  }
}
