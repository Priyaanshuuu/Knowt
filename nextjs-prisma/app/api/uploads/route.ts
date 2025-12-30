import { NextRequest , NextResponse } from "next/server";
import prisma from '@/lib/prisma'
import { requireAuth } from "@/lib/auth-helpers";
import {  UploadType } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import { UploadStatus } from "@/app/generated/prisma/enums";
import { uploadFiles } from "@/lib/storage";

export async function POST(req : NextRequest){
    try {
        const user = await requireAuth()
        if (user instanceof NextResponse) return user

        const formData = await req.formData()
        const type = formData.get("type") as string | null
        const file = formData.get("file") as File | null
        const source = formData.get("source") as string | null

        console.log("Upload request - Type:", type, "Has file:", !!file, "Has source:", !!source)

        if (!type) {
            return NextResponse.json(
                { error: "Type is required!" },
                { status: 400 }
            )
        }

        const validTypes = ["PDF", "AUDIO", "VIDEO", "LINK"]
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: "Invalid type. Must be PDF, AUDIO, VIDEO, or LINK" },
                { status: 400 }
            )
        }

        let fileUrl: string

        if (type === "PDF" || type === "AUDIO") {
            if (!file) {
                return NextResponse.json(
                    { error: `File is required for ${type} type` },
                    { status: 400 }
                )
            }

            if (type === "PDF" && file.type !== "application/pdf") {
                return NextResponse.json(
                    { error: "File must be a PDF (got: " + file.type + ")" },
                    { status: 400 }
                )
            }

            if (type === "AUDIO" && !file.type.startsWith("audio/")) {
                return NextResponse.json(
                    { error: "File must be an audio file (got: " + file.type + ")" },
                    { status: 400 }
                )
            }

            console.log("Processing file upload:", file.name, "Size", file.size, "Type", file.type)

            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const folder = type === "PDF" ? "uploads/pdfs" : "uploads/audio"
            fileUrl = await uploadFiles(buffer, file.name, folder)

            console.log("File uploaded successfully to:", fileUrl)
        } else if (type === "VIDEO" || type === "LINK") {
            if (!source) {
                return NextResponse.json(
                    { error: `Source URL is required for ${type} type` },
                    { status: 400 }
                )
            }

            console.log("Using source URL", source)
            fileUrl = source
        } else {
            return NextResponse.json(
                { error: "Invalid upload type" },
                { status: 400 }
            )
        }

        const upload = await prisma.upload.create({
            data: {
                userId: user.id,
                type: type as UploadType,
                source: fileUrl,
                status: UploadStatus.PENDING,
                error: ""
            },
        })

        console.log("Upload record created:", upload.id)

        return NextResponse.json(
            {
                success: true,
                upload: {
                    id: upload.id,
                    type: upload.type,
                    source: upload.source,
                    status: upload.status,
                    createdAt: upload.createdAt,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Upload creation error:", error)
        return NextResponse.json(
            { error: "Failed to create upload: " + (error as Error).message },
            { status: 500 }
        )
    }
}

export async function GET(req : NextRequest){
    try {
        const user = await requireAuth()
        if(user instanceof NextResponse) return user

        const {searchParams} = new URL(req.url)
        const status = searchParams.get("status")
        const type = searchParams.get("type")

        const where: Prisma.UploadWhereInput = {
            userId: user.id,
        };

        if(status){
            where.status = status as UploadStatus;
        }

        if(type){
            where.type = type as UploadType
        }

        const uploads = await prisma.upload.findMany({
            where,
            include: {
                summaries: {
                    select: {
                        id: true,
                        summaryText: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json({
            success: true,
            count: uploads.length,
            uploads,
        })

    } catch (error) {
        console.error("Fetch uploads error:", error)
        return NextResponse.json(
            { error: "Failed to fetch uploads" },
            { status: 500 }
        )
    }
}