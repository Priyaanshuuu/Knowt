"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react"
import { Oswald } from "next/font/google"

// --- Font Configuration (Matches Landing Page) ---
const oswald = Oswald({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
})

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Something went wrong")
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950 transition-colors duration-300 ${oswald.className}`}>
      
      {/* --- Background Blobs (Subtle & Matches Landing) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-50">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 dark:bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-900/10 rounded-full blur-[100px]" />
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
             <span className="text-4xl font-bold tracking-tighter uppercase text-slate-900 dark:text-white">
               KNOWT.
             </span>
          </Link>
          <h1 className="text-2xl font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Welcome Back
          </h1>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-slate-500 hover:text-black dark:hover:text-white transition-colors font-sans">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-sans"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            {/* Submit Button (Matches Landing Page CTA) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wide rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Accessing...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-sans">
              Do not have an account?{" "}
              <Link href="/register" className="text-slate-900 dark:text-white font-bold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium font-sans uppercase tracking-wide">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>
        </div>

      </motion.div>
    </div>
  )
}