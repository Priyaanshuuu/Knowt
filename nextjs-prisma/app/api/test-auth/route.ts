import { NextRequest , NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest){
    const user = await requireAuth()

    if(user instanceof NextResponse){
        return user
    }

    return NextResponse.json({
        message: "You are authenticated",
        user :{
            id : user.id,
            email : user.email,
            name : user.name,
        }
    })
}