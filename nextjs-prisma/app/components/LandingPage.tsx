"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Oswald } from "next/font/google"
import { 
  Bot, FileAudio, Languages, ArrowRight, Zap, FileText 
} from "lucide-react"
//import { ModeToggle } from "./ModeTOggle" 

// --- Font Configuration ---
const oswald = Oswald({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
})

// --- Feature Data ---
const features = [
  {
    id: 1,
    title: "AI Analysis",
    desc: "Deep context understanding.",
    icon: <Bot className="w-6 h-6" />, // Made icon slightly smaller
    color: "bg-blue-500",
    image: "from-blue-500 to-indigo-600"
  },
  {
    id: 2,
    title: "Audio Sync",
    desc: "Transcribe & summarize meetings.",
    icon: <FileAudio className="w-6 h-6" />,
    color: "bg-violet-500",
    image: "from-violet-500 to-purple-600"
  },
  {
    id: 3,
    title: "Polyglot",
    desc: "Translate across 30+ languages.",
    icon: <Languages className="w-6 h-6" />,
    color: "bg-emerald-500",
    image: "from-emerald-500 to-teal-600"
  },
  {
    id: 4,
    title: "Export",
    desc: "Push to Notion or PDF instantly.",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-orange-500",
    image: "from-orange-500 to-red-600"
  }
]

export default function LandingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={`min-h-screen bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-300 ${oswald.className}`}>
      
      {/* --- Navbar (Minimal) --- */}
      <nav className="fixed w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-white">
        <div className="text-2xl font-bold tracking-tighter uppercase">
          Knowt.
        </div>
        <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:block text-sm font-medium hover:underline underline-offset-4"
            >
              LOGIN
            </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-10">
        
        {/* --- Minimal Hero --- */}
        <div className="text-center mb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-[15vw] leading-[0.8] font-bold tracking-tighter uppercase select-none">
              KNOWT
            </h1>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="mt-6 space-y-6"
          >
            <p className="text-xl md:text-2xl font-light tracking-wide text-slate-500 dark:text-slate-400 font-sans">
              Intelligent Summaries for the Modern Mind.
            </p>
            
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-sans font-semibold hover:scale-105 transition-transform"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* --- Elastic / Expandable Feature Cards --- */}
        {/* UPDATED HEIGHT HERE: h-[600px] for mobile stack, md:h-[300px] for desktop row */}
        <div className="w-full max-w-6xl h-150 md:h-75 flex flex-col md:flex-row gap-2 md:gap-4 px-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              layout
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className={`
                relative overflow-hidden rounded-3xl cursor-pointer
                bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800
              `}
              animate={{ 
                flex: hoveredIndex === index ? 3 : 1,
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.6 : 1
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Background Gradient on Hover */}
              <motion.div 
                className={`absolute inset-0 bg-linear-to-br ${feature.image} opacity-0 transition-opacity duration-300`}
                animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
              />

              <div className="relative z-10 h-full flex flex-col justify-between p-5"> 
                
                {/* Top Icon Area */}
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-slate-900 dark:text-white ${hoveredIndex === index ? 'text-white' : ''}`}>
                    {feature.icon}
                  </div>
                  {hoveredIndex === index && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-1.5 bg-white/20 rounded-full"
                    >
                      <Zap className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Bottom Text Area */}
                <div>
                  <motion.h3 
                    layout="position"
                    className={`text-xl md:text-2xl font-bold uppercase mb-1 ${hoveredIndex === index ? 'text-white' : 'text-slate-900 dark:text-white'}`}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  {/* Description only shows when expanded */}
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="font-sans text-white/90 text-sm leading-relaxed"
                      >
                        {feature.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  )
}