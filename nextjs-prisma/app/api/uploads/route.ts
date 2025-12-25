import { NextRequest , NextResponse } from "next/server";
import prisma from '@/lib/prisma'
import { requireAuth } from "@/lib/auth-helpers";
import {  UploadType } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import { UploadStatus } from "@/app/generated/prisma/enums";


export async function POST(req : NextRequest){
    try {
        const user = await requireAuth();
        if(user instanceof NextResponse) return user;

        const body = await req.json();
        const { type , source  } = body;

        if(!type || !source){
            return NextResponse.json(
                {error : "Type and Source are required!!"},
                {status : 400}
            )
        }

        const validTypes = ["PDF" , "AUDIO" ,"VIDEO", "LINK"]
        if(!validTypes.includes(type)){
            return NextResponse.json(
                {error : "Invalid type. Must be PDF, AUDIO, VIDEO, or LINK "},
                {status: 400}
            )
        }

        const upload = await prisma.upload.create({
            data: {
                userId: user.id,
                type: type as UploadType,
                source,
                status: "PENDING",
            },
        })

        return NextResponse.json({
            success : true,
            upload: {
                id: upload.id,
                type: upload.type,
                source: upload.source,
                status: upload.status,
                createdAt: upload.createdAt,
            },
        },
        {status : 201})
         
    } catch (error) {
        console.log("Upload creation error:" , error)
        return NextResponse.json({
            error:"Failed to create upload"
        },
        {status : 500})
        
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