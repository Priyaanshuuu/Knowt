import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import {TimeAgo} from "@/app/components/TimeAgo"
import { DashboardStats } from "@/app/components/DashboardStats" // Import the client component
import { Oswald } from "next/font/google"
import { FileAudio, FileVideo, FileText, Clock, ChevronRight } from "lucide-react"

// --- Font Config ---
const oswald = Oswald({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-oswald"
})

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) return null

  // --- Fetch Data ---
  const [totalUploads, totalSummaries] = await Promise.all([
    prisma.upload.count({ where: { userId } }),
    prisma.summary.count({ where: { userId } }),
  ])

  const recentUploads = await prisma.upload.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { summary: true },
  })

  const recentSummaries = await prisma.summary.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { upload: true },
  })

  // --- Render ---
  return (
    <div className={`min-h-screen bg-neutral-950 text-white p-8 ${oswald.className}`}>
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-end border-b border-neutral-800 pb-6">
        <div>
           <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2">Dashboard</h1>
           <p className="text-neutral-500 font-sans">Welcome back, {session.user.name}</p>
        </div>
      </div>

      {/* Animated Stats Section */}
      <DashboardStats totalUploads={totalUploads} totalSummaries={totalSummaries} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
        
        {/* Recent Uploads List */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h3 className={`text-xl font-bold uppercase tracking-wide text-white ${oswald.className}`}>Recent Uploads</h3>
          </div>
          <div className="p-4">
            {recentUploads.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No uploads yet</p>
            ) : (
              <div className="space-y-3">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-700">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        upload.type === "PDF" ? "bg-red-500/10 text-red-500" :
                        upload.type === "AUDIO" ? "bg-blue-500/10 text-blue-500" :
                        "bg-purple-500/10 text-purple-500"
                      }`}>
                         {upload.type === "PDF" && <FileText className="w-5 h-5" />}
                         {upload.type === "AUDIO" && <FileAudio className="w-5 h-5" />}
                         {upload.type === "VIDEO" && <FileVideo className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {upload.fileName || "Untitled"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <p className="text-xs text-neutral-500">
                            <TimeAgo date = {upload.createdAt} />
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      upload.status === "DONE" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                      upload.status === "PROCESSING" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                      "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}>
                      {upload.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Summaries List */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <h3 className={`text-xl font-bold uppercase tracking-wide text-white ${oswald.className}`}>Recent Summaries</h3>
          </div>
          <div className="p-4">
            {recentSummaries.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No summaries yet</p>
            ) : (
              <div className="space-y-3">
                {recentSummaries.map((summary) => (
                  <Link
                    key={summary.id}
                    href={`/dashboard/summaries/${summary.id}`}
                    className="block p-4 rounded-xl hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                          {summary.upload?.fileName || "Untitled Summary"}
                        </p>
                        <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                          {summary.summaryText ? summary.summaryText : "No preview available..."}
                        </p>
                        <p className="text-xs text-neutral-600 mt-2 font-mono">
                          <TimeAgo date = {summary.createdAt} />
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}