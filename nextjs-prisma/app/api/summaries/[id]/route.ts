import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
   
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const summaryId = params.id

  
    const summary = await prisma.summary.findUnique({
      where: {
        id: summaryId,
      },
      include: {
        upload: true,
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