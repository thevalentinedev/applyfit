import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ConnectionsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-heading font-bold mb-4">Connections</h1>
            <p className="text-lg text-muted-foreground">
              Network with professionals and expand your career opportunities
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-md border p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-heading font-semibold mb-4">Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                The connections feature is currently in development. Soon you'll be able to:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground">
                <li>• Connect with industry professionals</li>
                <li>• Share your resume with your network</li>
                <li>• Get referrals and recommendations</li>
                <li>• Discover job opportunities through connections</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
