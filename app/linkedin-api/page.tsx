import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Linkedin, Users, Briefcase, TrendingUp, LinkIcon } from "lucide-react"

export default function LinkedInAPIPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-heading font-bold mb-4">LinkedIn API Integration</h1>
            <p className="text-lg text-muted-foreground">
              Seamless integration with LinkedIn for enhanced job application workflows
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-md border p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Linkedin className="h-8 w-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-heading font-semibold mb-4">Coming Soon</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our LinkedIn API integration is in active development. This feature will revolutionize how you discover
                and apply to jobs by connecting directly with LinkedIn's professional network.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-muted/50 rounded-lg p-6">
                  <Briefcase className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Job Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically discover relevant job opportunities from your LinkedIn network and beyond.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <Users className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">Network Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Leverage your professional network to find connections at target companies.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <LinkIcon className="h-8 w-8 text-purple-500 mb-3" />
                  <h3 className="font-semibold mb-2">Profile Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Sync your LinkedIn profile data to auto-populate resume fields and maintain consistency.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <TrendingUp className="h-8 w-8 text-orange-500 mb-3" />
                  <h3 className="font-semibold mb-2">Application Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your job applications and get insights on application performance and response rates.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>LinkedIn Partnership:</strong> We're working closely with LinkedIn's developer program to
                    ensure seamless, secure, and compliant integration with their platform.
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Privacy First:</strong> All LinkedIn data will be processed securely with your explicit
                    consent, following LinkedIn's API terms and privacy guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
