import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import SummaryActions from "./SummaryActions"

interface SummaryDetailPageProps {
  params: {
    id: string
  }
}

export default async function SummaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const { id } = await params  // <-- unwrap params

  const summary = await prisma.summary.findUnique({
    where: { id },
    include: {
      upload: true,
      translation: { orderBy: { createdAt: "desc" } },
      QnA: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!summary || summary.userId !== userId) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Conditional check: Only show badges if upload exists */}
            {summary.upload && (
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  summary.upload.type === "PDF" ? "bg-red-100 text-red-800" :
                  summary.upload.type === "AUDIO" ? "bg-blue-100 text-blue-800" :
                  summary.upload.type === "VIDEO" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {summary.upload.type}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {summary.upload.status}
                </span>
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {summary.upload?.fileName || summary.originalUrl || "Untitled Summary"}
            </h1>
            
            <p className="text-gray-600">
              Created {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      <SummaryActions summaryId={summary.id} />

      {/* TEXT SUMMARY */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {summary.summaryText}
        </p>
      </div>

      {/* TRANSLATIONS */}
      {summary.translation.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Translations ({summary.translation.length})
          </h2>
          <div className="space-y-6">
            {summary.translation.map((translation) => (
              <div key={translation.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {translation.language}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {translation.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Q&A SECTION */}
      {summary.QnA.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Questions & Answers ({summary.QnA.length})
          </h2>
          <div className="space-y-4">
            {summary.QnA.map((qna, index) => (
              <div key={qna.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-start">
                  <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  {qna.question}
                </h3>
                <p className="text-gray-700 ml-8">
                  {qna.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIO PLAYER */}
      {summary.audioUrl && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Audio Summary
          </h2>
          <audio controls className="w-full">
            <source src={summary.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* PDF DOWNLOAD (FIXED MISSING TAG) */}
      {summary.pdfUrl && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export</h2>
          
          <a
            href={summary.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
        </div>
      )}
    </div>
  )
}