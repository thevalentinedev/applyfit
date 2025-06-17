import { verifySession, getUserProfile } from "@/lib/dal"
import { UserProfileForm } from "@/components/dashboard/user-profile-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await verifySession()
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your personal information and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <UserProfileForm profile={profile} />
        </div>
      </main>
    </div>
  )
}
