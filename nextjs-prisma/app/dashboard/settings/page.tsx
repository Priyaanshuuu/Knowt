import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsContent } from "@/app/components/settingComp" // Import the client component

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Pass only serializable data to the client component
  const userData = {
    name: session.user.name,
    email: session.user.email
  }

  return <SettingsContent user={userData} />
}