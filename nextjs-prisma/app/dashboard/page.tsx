import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import  prisma  from "@/lib/prisma"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) return null

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Uploads */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Uploads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalUploads}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/upload" className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Upload new →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Summaries</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalSummaries}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/summaries" className="text-sm text-green-600 hover:text-green-700 mt-4 inline-block">
            View all →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
          </div>
          <div className="p-6">
            {recentUploads.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No uploads yet</p>
            ) : (
              <div className="space-y-4">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        upload.type === "PDF" ? "bg-red-100" :
                        upload.type === "AUDIO" ? "bg-blue-100" :
                        upload.type === "VIDEO" ? "bg-purple-100" :
                        "bg-gray-100"
                      }`}>
                        <span className="text-xs font-semibold">
                          {upload.type.substring(0, 3)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.fileName || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(upload.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      upload.status === "DONE" ? "bg-green-100 text-green-800" :
                      upload.status === "PROCESSING" ? "bg-yellow-100 text-yellow-800" :
                      upload.status === "FAILED" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {upload.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Summaries</h3>
          </div>
          <div className="p-6">
            {recentSummaries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No summaries yet</p>
            ) : (
              <div className="space-y-4">
                {recentSummaries.map((summary) => (
                  <Link
                    key={summary.id}
                    href={`/dashboard/summaries/${summary.id}`}
                    className="block hover:bg-gray-50 p-3 rounded-lg transition-colors -mx-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {summary.upload?.fileName || summary.originalUrl || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {summary.summaryText ? `${summary.summaryText.substring(0, 100)}...` : "No content"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">Ready to summarize?</h3>
        <p className="text-blue-100 mb-6">
          Upload your documents, audio, or share a link to get started with AI-powered summaries.
        </p>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Upload New File
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}