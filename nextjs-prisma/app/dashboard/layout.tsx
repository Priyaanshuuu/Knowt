import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Oswald } from "next/font/google"
import {
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  LogOut,
  User as UserIcon
} from "lucide-react"

// --- Font Configuration ---
const oswald = Oswald({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
})

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/dashboard/upload", icon: Upload },
    { name: "Summaries", href: "/dashboard/summaries", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className={`min-h-screen bg-neutral-950 flex ${oswald.variable}`}>
      
      {/* --- Sidebar --- */}
      <div className="fixed inset-y-0 left-0 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        
        {/* Logo Area */}
        <div className="flex items-center h-20 px-8 border-b border-neutral-800">
          <Link href="/" className="group">
             <h1 className={`text-3xl font-bold tracking-tighter uppercase text-white group-hover:text-blue-500 transition-colors ${oswald.className}`}>
              KNOWT.
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 font-sans">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3.5 text-neutral-400 rounded-xl hover:bg-neutral-800 hover:text-white transition-all group"
            >
              <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium tracking-wide">{item.name}</span>
            </Link>
          ))}
        </nav>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              {session.user.name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate font-sans">
                {session.user.name || "User"}
              </p>
              <p className="text-xs text-neutral-500 truncate font-sans">
                {session.user.email}
              </p>
            </div>
          </div>
          
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-neutral-400 bg-neutral-800/50 border border-neutral-800 rounded-xl hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 transition-all font-sans"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* --- Main Content Wrapper --- */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Note: We removed the white header here because the Dashboard Page 
            itself now handles the "Welcome" title with the new Oswald font styling.
        */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      
    </div>
  )
}