import { NextRequest , NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers";
import { generateSummary } from "@/lib/ai/grog_summarizer";
//import { extractTextfromPDF}  from "@/lib/extractors/pdf";
export async function POST(req: NextRequest){
    try {
        const user = await requireAuth();
        if(user instanceof NextResponse) return user

        const {uploadId} = await req.json()
        if(!uploadId){
            return NextResponse.json(
                {error : "uploadId is required"},
                {status : 400}
            )
        }

        const upload = await prisma.upload.findUnique({
            where : {id : uploadId},
        })

        if(!upload){
            return NextResponse.json(
                {error : "Uplaod not found"},
                {status : 404}
            )
        }

        if(upload.userId != user.id){
            return NextResponse.json(
                {error : "Unauthorized"},
                {status : 403}
            )
        }

        const existingSummary = await prisma.summary.findUnique({
            where : {id : upload.id , uploadId: upload.id}
        })

        if(existingSummary){
            return NextResponse.json(
                {error : "Uplaod already summarized"},
                {status : 400}
            )
        }

        await prisma.upload.update({
            where : {id : uploadId},
            data : {status: "PROCESSING"}
        })

        console.log("Status updated to PROCESSING");

        let text : string

        try {
            console.log("Extracting contetn from" , upload.type, "...");

            switch (upload.type) {
                case "PDF": {
                    const { extractTextfromPDF } = await import("@/lib/extractors/pdf")
                    text = await extractTextfromPDF(upload.source)
                    break;
                }

                case "AUDIO": {
                    const { transcribeAudio } = await import("@/lib/extractors/audio")
                    text = await transcribeAudio(upload.source)
                    break;
                }

                case "LINK": {
                    const { extractTextfromWeb } = await import("@/lib/extractors/web")
                    text = await extractTextfromWeb(upload.source)
                    break;
                }
            
                default:
                    throw new Error(`Unsupported type ${upload.type}`)
            }
            console.log("Content extracted successfully");
            console.log("Text Length" , text.length , "characters");
            
        } catch (error) {
            console.log("Extraction Error" , error);
            
            await prisma.upload.update({
                where : {id : uploadId},
                data: {
                    status : "FAILED",
                    error : `Summarization Failed: ${(error as Error).message}`
                }
            })

            return NextResponse.json(
                {error : `Content extraction failed: ${(error as Error).message} `},
                {status : 500}
            )
        }

        let summaryText: string

    try {
      console.log("Generating AI summary...")
      summaryText = await generateSummary(text)
      console.log("Summary generated successfully")

    } catch (summaryError) {
      console.error("Summary generation error:", summaryError)

     
      await prisma.upload.update({
        where: { id: uploadId },
        data: { 
          status: "FAILED",
          error: `Summarization failed: ${(summaryError as Error).message}`
        },
      })

      return NextResponse.json(
        { error: `Summary generation failed: ${(summaryError as Error).message}` },
        { status: 500 }
      )
    }

    
    const summary = await prisma.summary.create({
      data: {
        userId: user.id,
        uploadId: upload.id,
        summaryText,
        language: "en",
        inputType : upload.type,
        originalUrl: upload.source
      },
    })

    console.log("Summary saved to database:", summary.id)

  
    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: "DONE" },
    })

    console.log("Status updated to DONE")
    console.log("=== SUMMARIZATION COMPLETE ===")

    return NextResponse.json({
      success: true,
      summary: {
        id: summary.id,
        summaryText: summary.summaryText,
        uploadId: summary.uploadId,
        createdAt: summary.createdAt,
      }
    }, { status: 201 })
        
        
    } catch (error) {
           console.error("Summarization error:", error)
    return NextResponse.json(
      { error: "Failed to process summarization" },
      { status: 500 }
    )
        
    }
}