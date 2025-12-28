import { NextRequest , NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers";
import { UploadStatus } from "@/app/generated/prisma/enums";
import { deleteFile } from "@/lib/storage";



export async function GET(
    req : NextRequest,
    {params} : {params : {id : string}}
){
    try {

        const user = await requireAuth()
        if(user instanceof NextResponse) return user

        const uploadId = params.id

        const upload = await prisma.upload.findUnique({
            where: {
                id : uploadId,
            },
            include: {
                summaries: {
                    include: {
                        share : true,
                    }
                }
            }
        })

        if(!upload){
            return NextResponse.json(
                {error : "Upload not found"},
                {status : 404}
            )
        }

        return NextResponse.json({
            success : true,
            upload,
        })
        
    } catch (error) {
        console.log("Fetch upload error!" , error);
        return NextResponse.json(
            {error : "Failed to fetch upload"},
            {status : 500}
        )
    }
}

export async function PATCH(
    req : NextRequest,
    {params} : {params : {id : string}}
){
    try {
        const user = await requireAuth()
        if(user instanceof NextResponse) return user
        
        const uploadId = params.id
        const body : { status : string} = await req.json();
        const { status } = body;

        const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
        if(status && !validStatuses.includes(status)){
            return NextResponse.json(
                { error : "Invalid status value"},
                {status : 400}
            )
        }

        const upload = await prisma.upload.findUnique({
            where : { id : uploadId}
        })

        if(!upload){
            return NextResponse.json(
                { error : "Upload not found"},
                {status : 404}
            )
        }

        if(upload.userId != user.id){
            return NextResponse.json(
                {error : "Unauthorized"},
                {status : 403}
            )
        }

        const updatedUpload = await prisma.upload.update({
            where: {id : uploadId},
            data: {
                status : (status as UploadStatus) || upload.status,
                
            }
        })

        return NextResponse.json(
            {success : true ,
                upload : updatedUpload,
            }
        )

    } catch (error) { 
        console.error("Update upload error" , error)
        return NextResponse.json({
            error : "Failed to update upload"
        },
    {status : 500})
    }
}

  export async function DELETE(
        req : NextRequest,
        {params} : { params: { id : string}}
    ){
        try {
            const user = await requireAuth();
            if(user instanceof NextResponse) return user

            const uploadId = params.id

            const upload = await prisma.upload.findUnique({
                where: {id : uploadId}
            })

            if(!upload){
                return NextResponse.json(
                    {error : "Upload not found"},
                    {status : 404}
                )
            }

            if(upload.userId !== user.id){
                return NextResponse.json(
                    {error : "Upload not found"},
                    {status : 404}
                )
            }

            if(upload.type === "PDF" || upload.type === "AUDIO"){
                try {
                    const deleted = await deleteFile(upload.source)
                    if(deleted){
                        console.log("File deleted from Imagekit" , upload.source);
                    } else{
                        console.log("File not found in Imagekit(may have been already deleted)");
                    }
                    
                } catch (error) {
                    console.log("Failed to delete file from Imagekit" , error);
                }
            }

            await prisma.upload.delete({
                where: {id : uploadId}
            })

            return NextResponse.json({
                success  : true,
                message : "Upload and file deleted successfully",
            })
        } catch (error) {
            console.log("Delete upload error" , error);
            return NextResponse.json(
                {error : "Failed to delete upload"},
                {status : 500}
            )
        }
    }