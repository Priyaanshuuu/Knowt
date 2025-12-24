import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import  prisma  from "./prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider (Email + Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // Github Provider
     GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  // Use JWT for sessions
  session: {
    strategy: "jwt",
  },

  // Custom pages
  pages: {
    signIn: "/login",
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account }) {
      // Handle OAuth sign in
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          // Create new user for OAuth
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
             image: user.image ?? '',
             password: '',
            }
          })
        }
      }
      return true
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
}