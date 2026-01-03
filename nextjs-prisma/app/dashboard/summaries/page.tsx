import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import  prisma  from "@/lib/prisma"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function SummariesPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) return null


  const summaries = await prisma.summary.findMany({
    where: { userId },
    include: {
      upload: true,
      translation: true,
      QnA: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Summaries</h1>
          <p className="text-gray-600 mt-1">
            {summaries.length} {summaries.length === 1 ? "summary" : "summaries"} created
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Upload
        </Link>
      </div>
      {summaries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No summaries yet</h3>
          <p className="text-gray-600 mb-6">Upload your first file to get started with AI summaries.</p>
          <Link
            href="/dashboard/upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary) => (
            <Link
              key={summary.id}
              href={`/dashboard/summaries/${summary.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                {summary.upload && (
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                      summary.upload.type === "PDF" ? "bg-red-100 text-red-800" :
                      summary.upload.type === "AUDIO" ? "bg-blue-100 text-blue-800" :
                      summary.upload.type === "VIDEO" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {summary.upload.type}
                    </div>
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
                  {summary.upload?.fileName || summary.originalUrl || "Untitled"}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {summary.summaryText}
                </p>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}
                  </span>
                  <div className="flex items-center space-x-2">
                    {summary.translation.length > 0 && (
                      <span className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {summary.translation.length}
                      </span>
                    )}
                    {summary.QnA.length > 0 && (
                      <span className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {summary.QnA.length}
                      </span>
                    )}
                    {summary.audioUrl && (
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                    {summary.pdfUrl && (
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}