"use client"

import { motion } from "framer-motion"
import { Oswald } from "next/font/google"
import { 
  User, Mail, Shield, Server, 
  Trash2, CreditCard 
} from "lucide-react"

const oswald = Oswald({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
})

interface SettingsContentProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function SettingsContent({ user }: SettingsContentProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${oswald.className}`}>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-2">
          System Settings
        </h1>
        <p className="text-neutral-400 font-sans">
          Manage identity, preferences, and system protocols.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 font-sans"
      >
        {/* --- Profile Section --- */}
        <motion.div variants={itemVariants}>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-neutral-700 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <User className="w-32 h-32" />
            </div>

            <h2 className={`text-xl font-bold text-white mb-6 uppercase tracking-wide flex items-center gap-2 ${oswald.className}`}>
              <User className="w-5 h-5 text-blue-500" /> Identity
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                  Display Name
                </label>
                <div className="flex items-center px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-white">
                  <User className="w-4 h-4 mr-3 text-neutral-500" />
                  {user.name || "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-400">
                  <Mail className="w-4 h-4 mr-3 text-neutral-600" />
                  {user.email || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- Plan Section --- */}
        <motion.div variants={itemVariants}>
           <div className="bg-linear-to-br from-blue-900/10 to-indigo-900/10 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
             <div className="flex items-start justify-between relative z-10">
               <div>
                 <h2 className={`text-xl font-bold text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-2 ${oswald.className}`}>
                   <CreditCard className="w-5 h-5" /> Current Plan
                 </h2>
                 <p className="text-3xl font-bold text-white tracking-tight">Free Tier</p>
                 <p className="text-blue-200/60 text-sm mt-1">Unlimited basic summaries.</p>
               </div>
               <div className="px-4 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase rounded-full tracking-wider">
                 Active
               </div>
             </div>
           </div>
        </motion.div>

        {/* --- Services Grid --- */}
        <motion.div variants={itemVariants}>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8">
            <h2 className={`text-xl font-bold text-white mb-6 uppercase tracking-wide flex items-center gap-2 ${oswald.className}`}>
               <Server className="w-5 h-5 text-emerald-500" /> AI Services Status
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "Summarization Engine", provider: "Groq LPU", status: "Operational" },
                { name: "Translation Matrix", provider: "Groq LPU", status: "Operational" },
                { name: "Audio Synthesis", provider: "OpenAI TTS", status: "Operational" },
                { name: "Secure Storage", provider: "ImageKit CDN", status: "Optimized" },
              ].map((service, idx) => (
                <div key={idx} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-neutral-300">{service.name}</p>
                    <p className="text-xs text-neutral-600">{service.provider}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-500 font-mono uppercase">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- Danger Zone --- */}
        <motion.div variants={itemVariants}>
          <div className="bg-red-950/10 border border-red-900/30 rounded-3xl p-8 hover:bg-red-950/20 transition-colors">
             <h2 className={`text-xl font-bold text-red-500 mb-2 uppercase tracking-wide flex items-center gap-2 ${oswald.className}`}>
               <Shield className="w-5 h-5" /> Danger Zone
             </h2>
             <p className="text-red-400/60 text-sm mb-6">
               Destructive actions that cannot be undone. Proceed with caution.
             </p>
             
             <div className="flex items-center justify-between p-4 bg-red-950/30 rounded-xl border border-red-900/20">
               <div>
                 <p className="text-white font-bold text-sm">Delete Account</p>
                 <p className="text-neutral-500 text-xs">Permanently remove all data and access.</p>
               </div>
               <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-2">
                 <Trash2 className="w-3 h-3" /> Delete
               </button>
             </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}