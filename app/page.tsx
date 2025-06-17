import { JobUrlForm } from "@/components/job-url-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getUserProfile, verifySession } from "@/lib/dal"

export default async function Home() {
  // Check if user is authenticated first
  let userProfile = null
  let isAuthenticated = false

  try {
    const session = await verifySession()
    isAuthenticated = session.isAuth

    // Only fetch profile data if user is authenticated
    if (isAuthenticated) {
      userProfile = await getUserProfile()
      console.log("✅ User profile loaded:", {
        name: userProfile?.full_name,
        email: userProfile?.email,
        hasEducation: !!(userProfile?.education && userProfile.education.length > 0),
        hasExperience: !!(userProfile?.professional_experience && userProfile.professional_experience.length > 0),
      })
    }
  } catch (error) {
    console.log("ℹ️ Error loading profile:", error)
    userProfile = null
    isAuthenticated = false
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-heading font-bold mb-4">Smart Resume Generator</h1>
            <p className="text-lg text-muted-foreground font-body">
              AI-powered tool that tailors your resume and cover letter to specific job descriptions
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-md border p-8">
            <JobUrlForm userProfile={userProfile} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
