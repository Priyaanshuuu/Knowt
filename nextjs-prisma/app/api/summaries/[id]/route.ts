import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

// GET /api/summaries/[id] - Get single summary with all relations
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const summaryId = params.id

    // Fetch summary with all relations
    const summary = await prisma.summary.findUnique({
      where: {
        id: summaryId,
      },
      include: {
        upload: true,
        translations: {
          orderBy: {
            createdAt: "desc"
          }
        },
        qnas: {
          orderBy: {
            createdAt: "asc"
          }
        },
        share: true,
      }
    })

    // Check if exists
    if (!summary) {
      return NextResponse.json(
        { error: "Summary not found" },
        { status: 404 }
      )
    }

    // Check ownership
    if (summary.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to view this summary" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      summary,
    })

  } catch (error) {
    console.error("Fetch summary error:", error)
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    )
  }
}