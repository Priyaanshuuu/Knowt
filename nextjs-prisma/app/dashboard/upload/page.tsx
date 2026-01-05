"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Oswald } from "next/font/google"
import { 
  FileText, Music, Video, Link as LinkIcon, 
  UploadCloud, X, Loader2, CheckCircle2, ArrowRight, Zap 
} from "lucide-react"

// --- Font Config ---
const oswald = Oswald({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
})

type UploadType = "PDF" | "AUDIO" | "VIDEO" | "LINK"

const tabs = [
  { id: "PDF", label: "Document", icon: FileText, desc: "Upload PDFs" },
  { id: "AUDIO", label: "Audio", icon: Music, desc: "MP3, WAV" },
  { id: "VIDEO", label: "Video", icon: Video, desc: "YouTube URL" },
  { id: "LINK", label: "Link", icon: LinkIcon, desc: "Web Articles" },
] as const

export default function UploadPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<UploadType>("PDF")
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

  // --- Handlers ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (selectedFile: File) => {
    setError("")
    if (activeTab === "PDF" && selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file")
      return
    }
    if (activeTab === "AUDIO" && !selectedFile.type.startsWith("audio/")) {
      setError("Please select an audio file (MP3, WAV, etc.)")
      return
    }
    setFile(selectedFile)
  }

  const handleUpload = async () => {
    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("type", activeTab)

      if (activeTab === "PDF" || activeTab === "AUDIO") {
        if (!file) {
          setError("Please select a file")
          setUploading(false)
          return
        }
        formData.append("file", file)
      } else {
        if (!linkUrl) {
          setError("Please enter a URL")
          setUploading(false)
          return
        }
        formData.append("source", linkUrl)
      }

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        const uploadId = data.upload.id
        // Trigger background processing
        fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId }),
        })
        router.push("/dashboard/summaries")
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (error) {
      setError("Something went wrong")
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${oswald.className}`}>
      
      {/* --- Header --- */}
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-2">
          Upload Content
        </h1>
        <p className="text-neutral-400 font-sans">
          Feed our AI. Select a source type below.
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        
        {/* --- Elastic Tab Switcher (New Animation) --- */}
        <div className="flex flex-col md:flex-row gap-3 mb-8 h-auto md:h-24">
          {tabs.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setFile(null)
                  setLinkUrl("")
                  setError("")
                }}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 flex items-center justify-center
                  ${isActive 
                    ? "bg-white border-white text-black" 
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }
                `}
                // Elastic Animation Logic
                animate={{ 
                  flex: isActive ? 3 : 1,
                  opacity: 1
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="flex flex-col items-center gap-1 min-w-20">
                  <tab.icon className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-neutral-500"}`} />
                  <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? "text-black" : "text-neutral-500"}`}>
                    {tab.label}
                  </span>
                  
                  {/* Description only visible when active */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] font-sans text-neutral-500 font-medium"
                      >
                        {tab.desc}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active Indicator Dot */}
                {isActive && (
                   <motion.div 
                     layoutId="active-dot"
                     className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600" 
                   />
                )}
              </motion.button>
             )
          })}
        </div>

        {/* --- Content Area --- */}
        <div className="font-sans">
          <AnimatePresence mode="wait">
            {(activeTab === "PDF" || activeTab === "AUDIO") ? (
              <motion.div
                key="file-upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${dragActive 
                      ? "border-blue-500 bg-blue-500/10 scale-[1.01]" 
                      : "border-neutral-700 hover:border-neutral-500 bg-neutral-950/50"
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                      <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <p className={`text-xl font-bold text-white mb-1 ${oswald.className} uppercase`}>
                        {file.name}
                      </p>
                      <p className="text-sm text-neutral-500 mb-6">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={() => setFile(null)}
                        className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center justify-center gap-2 mx-auto uppercase tracking-wide"
                      >
                        <X className="w-4 h-4" /> Remove file
                      </button>
                    </motion.div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className={`text-xl font-bold text-white mb-2 ${oswald.className} uppercase`}>
                        Drop your {activeTab.toLowerCase()}
                      </p>
                      <p className="text-sm text-neutral-500 mb-6">
                        or click to browse system files
                      </p>
                      <label className="inline-flex px-8 py-3 bg-white text-neutral-950 rounded-xl font-bold hover:bg-neutral-200 cursor-pointer transition-colors shadow-lg shadow-white/5 uppercase tracking-wide">
                        Choose File
                        <input
                          type="file"
                          className="hidden"
                          accept={activeTab === "PDF" ? ".pdf" : "audio/*"}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileChange(e.target.files[0])
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="url-upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-8">
                   {activeTab === "VIDEO" ? (
                     <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
                       <p className="text-yellow-400 font-bold text-lg mb-2">⚠️ Service Temporarily Down</p>
                       <p className="text-yellow-300/80 text-sm">Sorry, video transcribing is currently down. We apologize for the inconvenience. Please try again later.</p>
                     </div>
                   ) : (
                     <>
                       <label className={`block text-lg font-bold text-white uppercase tracking-wide mb-4 ${oswald.className}`}>
                         Web Page URL
                       </label>
                       <div className="relative">
                          <input
                              type="url"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              placeholder="https://example.com/article"
                              className="w-full px-6 py-5 bg-neutral-900 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white placeholder:text-neutral-600 font-mono text-lg"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-neutral-800 rounded-lg">
                            <LinkIcon className="w-4 h-4 text-neutral-400" />
                          </div>
                       </div>
                       
                       <p className="text-xs text-neutral-500 mt-4 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          Pro Tip: Works best with blogs and news articles.
                       </p>
                     </>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Error Message --- */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-red-900/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-sans"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Submit Button --- */}
        <div className="mt-8 font-sans">
          <button
            onClick={handleUpload}
            disabled={uploading || (!file && !linkUrl)}
            className="w-full px-6 py-4 bg-white text-neutral-950 font-bold uppercase tracking-wide rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Start Analysis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Process Info Card --- */}
      <div className="bg-linear-to-br from-blue-900/10 to-indigo-900/10 border border-blue-500/10 rounded-3xl p-8 font-sans">
        <h3 className={`font-bold text-blue-400 mb-4 text-xl ${oswald.className} uppercase tracking-wide flex items-center gap-2`}>
          <Zap className="w-5 h-5" /> System Protocol
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-400 text-sm">
          {[
            "Secure encryption enabled.",
            "AI Context extraction.",
            "Key insight generation.",
            "Multi-format export ready."
          ].map((item, idx) => (
             <li key={idx} className="flex items-center gap-3 p-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               {item}
             </li>
          ))}
        </ul>
      </div>
    </div>
  )
}