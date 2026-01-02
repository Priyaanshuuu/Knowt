import { NextRequest , NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers";
import { translateText , SUPPORTED_LANGUAGES } from "@/lib/ai/translate";

export async function POST(req : NextRequest){
    try {
        const user = await requireAuth()
        if(user instanceof NextResponse) return user

        const {summaryId , targetLanguage} = await req.json()

        console.log("DEBUG: Received Request");
console.log("DEBUG: summaryId:", summaryId); 
console.log("DEBUG: targetLanguage:", targetLanguage);

        if(!summaryId || !targetLanguage){
            return NextResponse.json(
                {error: "summaryId and targetLanguage is required!"},
                {status: 400}
            )
        }
        if( !SUPPORTED_LANGUAGES.includes(targetLanguage)){
            return NextResponse.json(
                {error: "Language Not Supported!"},
                {status: 400}
            )
        }

        const summary = await prisma.summary.findUnique({
            where: {id: summaryId},
        })

        if(!summary){
            return NextResponse.json(
                {error : "Summary not found!"},
                {status : 403}
            )
        }

        if(!summary.summaryText){
            return NextResponse.json(
                {error: "Summary text is empty, cannot translate!"},
                {status: 400}
            )
        }

         const existingTranslation = await prisma.translation.findUnique({
          where: {
            summaryId_language: {
              summaryId: summaryId,
              language: targetLanguage,
            }
          }
        })

    if (existingTranslation) {
      console.log("Translation already exists, returning cached version")
      return NextResponse.json({
        success: true,
        translation: {
          id: existingTranslation.id,
          language: existingTranslation.language,
          content: existingTranslation.content,
          createdAt: existingTranslation.createdAt,
        },
        cached: true,
      })
    }

    console.log("Translating summary....");

    const translatedContent = await translateText(summary.summaryText , targetLanguage)
    
    const translation = await prisma.translation.create({
      data: {
        summaryId: summaryId,
        language: targetLanguage,
        content: translatedContent
      }
    })

   console.log("Translation completed!!");

   return NextResponse.json({
     success: true,
     translation: {
       id: translation.id,
       language: translation.language,
       content: translation.content,
       createdAt: translation.createdAt,
     },
     cached: false,
   }, {status: 201})
   
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json(
            {error: "Failed to translate summary"},
            {status: 500}
        )
    }
}

export async function GET(req : NextRequest){
    try {
        const user = await requireAuth();
        if(user instanceof NextResponse) return user

        const {searchParams} = new URL(req.url)
        const summaryId = searchParams.get("summaryId")

        if(!summaryId){
            return NextResponse.json(
                {error : "SummaryId is required!!"},
                {status : 400}
            )
        }

        const summary = await prisma.summary.findUnique({
            where : {id : summaryId}
        })

        if(!summary){
            return NextResponse.json(
                {error : "Summary not found!!"},
                {status : 404}
            )
        }

        if(summary.userId != user.id){
            return NextResponse.json(
                {error : "Unauthorized User!"},
                {status : 403}
            )
        }

        const translations = await prisma.translation.findMany({
            where : {summaryId : summaryId},
            orderBy : {createdAt : "desc"}
        })
         return NextResponse.json({
              success : true,
              count : translations.length,
              translations
         }
         )
        
    } catch (error) {
        console.log("Fetch translations error" , error);
        return NextResponse.json(
            {error : "Failed to fetch translations"},
            {status : 500}
        )
    }
}