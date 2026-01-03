"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type UploadType = "PDF" | "AUDIO" | "VIDEO" | "LINK"

export default function UploadPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<UploadType>("PDF")
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)

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
      console.log(error);
      
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Content</h1>
        <p className="text-gray-600 mt-1">
          Upload a file or share a link to generate AI summaries
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-2 border-b border-gray-200 mb-6">
          {(["PDF", "AUDIO", "VIDEO", "LINK"] as UploadType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveTab(type)
                setFile(null)
                setLinkUrl("")
                setError("")
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === type
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {(activeTab === "PDF" || activeTab === "AUDIO") && (
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div>
                  <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your {activeTab.toLowerCase()} file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse
                  </p>
                  <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
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
          </div>
        )}
        {(activeTab === "VIDEO" || activeTab === "LINK") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === "VIDEO" ? "YouTube URL" : "Web Page URL"}
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={
                activeTab === "VIDEO"
                  ? "https://youtube.com/watch?v=..."
                  : "https://example.com/article"
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              {activeTab === "VIDEO"
                ? "Enter a YouTube video URL to summarize"
                : "Enter any web page URL to extract and summarize content"}
            </p>
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading || (!file && !linkUrl)}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload & Summarize"
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          What happens next?
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Your content will be uploaded securely
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            AI will extract and analyze the content
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            A concise summary will be generated
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You can then translate, generate Q&A, create audio, and export PDF
          </li>
        </ul>
      </div>
    </div>
  )
}