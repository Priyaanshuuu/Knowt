import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create JWT token manually
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name 
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "30d" }
    )

    // Set cookie manually
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

    // Set session cookie
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}