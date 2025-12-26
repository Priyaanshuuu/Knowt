import { NextRequest , NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const {email , password , name} = body

        if(!email || !password){
            return NextResponse.json(
                {error: "Email and password is required!!"},
                {status:400}
            )
        }

        if(password.length < 6){
            return NextResponse.json(
                {error : "Password must be at least 6 characters"},
                {status : 400}
            )
        }

        const existingUser = await prisma.user.findUnique({
            where : {email}
        })

        if(existingUser){
            return NextResponse.json(
                {error : "User already exists"},
                {status : 400}
            )
        }

        const hashedPassword = await bcrypt.hash(password , 10)

        const user = await prisma.user.create({
            data: {
                email, 
                password : hashedPassword,
                name : name! ,
              //  image : "",
            }
        })

        return NextResponse.json({
            user : {
                id : user.id,
                email : user.email,
                name : user.name,
            },
        },    {status : 201})

    }catch(error){
        console.log("Registration Error!!" , error)
        return NextResponse.json(
            {error : "Something went wrong in registration "},
            {status: 400}
        )
    }
}