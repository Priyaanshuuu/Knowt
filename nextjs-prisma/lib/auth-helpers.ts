import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

export async function getCurrentUser() {
  try {
    console.log("=== AUTH DEBUG START ===")
    
    // Try NextAuth session first
    const session = await getServerSession(authOptions)
    console.log("NextAuth session:", session)
    
    if (session?.user) {
      console.log("✅ NextAuth session found:", session.user.email)
      return session.user
    }

    // Fallback: Check custom auth-token
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    console.log("All cookies:", allCookies.map(c => c.name))
    
    const token = cookieStore.get("auth-token")
    console.log("auth-token cookie:", token ? "Found" : "Not found")
    
    if (token) {
      console.log("Token value (first 50 chars):", token.value.substring(0, 50))
      try {
        const decoded = verify(token.value, process.env.NEXTAUTH_SECRET!) as any
        console.log("✅ Custom token decoded:", decoded.email)
        return {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        }
      } catch (error) {
        console.error("❌ Token verification failed:", error)
      }
    }

    console.log("❌ No valid session or token found")
    console.log("=== AUTH DEBUG END ===")
    return null
  } catch (error) {
    console.error("❌ Session error:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    console.log("❌ Authentication required - returning 401")
    return NextResponse.json(
      { error: "Unauthorized - Please login first" },
      { status: 401 }
    )
  }
  
  console.log("✅ Authenticated user:", user.email)
  return user
}