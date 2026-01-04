"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Oswald } from "next/font/google"

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] })

interface DashboardStatsProps {
  totalUploads: number
  totalSummaries: number
}

export function DashboardStats({ totalUploads, totalSummaries }: DashboardStatsProps) {
  const [hovered, setHovered] = useState<"uploads" | "summaries" | null>(null)

  return (
    <div className={`flex flex-col md:flex-row gap-4 h-75 mb-8 ${oswald.className}`}>
      {/* --- Elastic Box 1: Uploads --- */}
      <motion.div
        onHoverStart={() => setHovered("uploads")}
        onHoverEnd={() => setHovered(null)}
        animate={{ flex: hovered === "uploads" ? 2 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between group cursor-pointer"
      >
        <motion.div 
           className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-900 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="p-3 bg-neutral-800 rounded-xl text-blue-400 group-hover:text-white transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-5xl font-bold text-white tracking-tighter">
            {totalUploads}
          </span>
        </div>

        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-neutral-400 group-hover:text-white uppercase transition-colors">
            Total Uploads
          </h3>
          <Link href="/dashboard/upload" className="flex items-center gap-2 text-sm text-blue-500 mt-2 hover:underline">
            Upload New <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* --- Elastic Box 2: Summaries --- */}
      <motion.div
        onHoverStart={() => setHovered("summaries")}
        onHoverEnd={() => setHovered(null)}
        animate={{ flex: hovered === "summaries" ? 2 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between group cursor-pointer"
      >
        <motion.div 
           className="absolute inset-0 bg-linear-to-br from-emerald-600 to-teal-900 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        />

        <div className="relative z-10 flex justify-between items-start">
          <div className="p-3 bg-neutral-800 rounded-xl text-emerald-400 group-hover:text-white transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-5xl font-bold text-white tracking-tighter">
            {totalSummaries}
          </span>
        </div>

        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-neutral-400 group-hover:text-white uppercase transition-colors">
            Total Summaries
          </h3>
          <Link href="/dashboard/summaries" className="flex items-center gap-2 text-sm text-emerald-500 mt-2 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}