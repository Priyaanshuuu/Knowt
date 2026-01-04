"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { Oswald } from "next/font/google"

// --- Font Config ---
const oswald = Oswald({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
})

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/login?registered=true")
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("Something went wrong")
      console.log(error);
      
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative flex items-center justify-center overflow-hidden bg-neutral-950 text-white transition-colors duration-300 ${oswald.className}`}>
      
      {/* --- Background Blobs --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full px-4 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
             <span className="text-4xl font-bold tracking-tighter uppercase text-white hover:text-blue-500 transition-colors">
               KNOWT.
             </span>
          </Link>
          <h1 className="text-xl font-medium uppercase tracking-wide text-neutral-400">
            Create Account
          </h1>
        </div>

        {/* Register Form Card */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-neutral-300 font-sans">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white placeholder:text-neutral-600 font-sans"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-neutral-300 font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white placeholder:text-neutral-600 font-sans"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-neutral-300 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white placeholder:text-neutral-600 font-sans"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-neutral-500 ml-1 font-sans">
                Must be at least 6 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-sans"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white text-black font-bold uppercase tracking-wide rounded-full hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-neutral-500 text-sm font-sans">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm font-medium font-sans uppercase tracking-wide">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
      </motion.div>
    </div>
  )
}