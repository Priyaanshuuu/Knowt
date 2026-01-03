"use client"

import { useState } from "react"

interface SummaryActionsProps {
  summaryId: string
}

export default function SummaryActions({ summaryId }: SummaryActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    const language = prompt("Enter target language (e.g., Spanish, French, German):")
    if (!language) return

    setLoading(true)
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId, targetLanguage: language }),
      })

      const data = await res.json()

      if (data.success) {
        alert(`Translation to ${language} created! Refresh to see it.`)
        window.location.reload()
      } else {
        alert(data.error || "Translation failed")
      }
    } catch (error) {
      alert("Error translating")
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQnA = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId, numQuestions: 5 }),
      })

      const data = await res.json()

      if (data.success) {
        alert("Q&A generated! Refresh to see it.")
        window.location.reload()
      } else {
        alert("Q&A generation failed")
      }
    } catch (error) {
      alert("Error generating Q&A")
      console.log(error);
      
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAudio = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/text_to_speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId }),
      })

      const data = await res.json()

      if (data.success) {
        alert("Audio summary generated! Refresh to see it.")
        window.location.reload()
      } else {
        alert("Audio generation failed")
      }
    } catch (error) {
      alert("Error generating audio")
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/pdf_share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId }),
      })

      const data = await res.json()

      if (data.success) {
        alert("PDF exported! Refresh to see download link.")
        window.location.reload()
      } else {
        alert("PDF export failed")
      }
    } catch (error) {
      alert("Error exporting PDF")
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Translate */}
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Translate</span>
        </button>

        {/* Generate Q&A */}
        <button
          onClick={handleGenerateQnA}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Generate Q&A</span>
        </button>

        {/* Generate Audio */}
        <button
          onClick={handleGenerateAudio}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Audio</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPDF}
          disabled={loading}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-8 h-8 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Export PDF</span>
        </button>
      </div>

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Processing...
        </div>
      )}
    </div>
  )
}