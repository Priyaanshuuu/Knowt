import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              defaultValue={session.user.name || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={session.user.email || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">Free Plan</span>
              <span className="text-sm text-blue-700">Unlimited summaries</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Usage */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Services</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Summarization</span>
            <span className="font-medium text-green-600">Groq (FREE)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Translation</span>
            <span className="font-medium text-green-600">Groq (FREE)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Q&A Generation</span>
            <span className="font-medium text-green-600">Groq (FREE)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Audio Summary</span>
            <span className="font-medium text-blue-600">OpenAI TTS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">File Storage</span>
            <span className="font-medium text-green-600">ImageKit (FREE)</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
        <h2 className="text-xl font-semibold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Irreversible and destructive actions
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  )
}