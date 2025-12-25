import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  try {
 
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

 
    const summaries = await prisma.summary.findMany({
      where: {
        userId: user.id,
      },
      include: {
        upload: {
          select: {
            type: true,
           // fileName: true,
            createdAt: true,
          }
        },
        share: {
          select: {
            slug: true,
           // views: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      success: true,
      count: summaries.length,
      summaries,
    })

  } catch (error) {
    console.error("Fetch summaries error:", error)
    return NextResponse.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    )
  }
}