import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getCurrentUSer(){
    const session = await getServerSession(authOptions)
    return session?.user
}

export async function requireAuth(){
    const user = await getCurrentUSer()

    if(!user){
        return NextResponse.json({
            error: "Unauthorized User!!"
        },
    {status : 401})
    }
    return user;
}