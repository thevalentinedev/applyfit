import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-6">Terms of Service</h1>
          <div className="bg-card rounded-xl shadow-md border p-8 prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">Last updated: January 2025</p>

            <h2>Acceptance of Terms</h2>
            <p>
              By using Applyfit, you agree to these Terms of Service. If you do not agree to these terms, please do not
              use our service.
            </p>

            <h2>Service Description</h2>
            <p>
              Applyfit is an AI-powered tool that helps users create tailored resumes and cover letters based on job
              descriptions. Our service is provided "as is" and we make no guarantees about job placement or hiring
              outcomes.
            </p>

            <h2>User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>Providing accurate information</li>
              <li>Using the service for lawful purposes only</li>
              <li>Respecting intellectual property rights</li>
              <li>Not attempting to reverse engineer our AI algorithms</li>
            </ul>

            <h2>Limitation of Liability</h2>
            <p>
              Applyfit is not responsible for hiring decisions made by employers. Our service is a tool to assist in
              resume creation, not a guarantee of employment.
            </p>

            <h2>Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:hello@valentine.dev" className="text-primary hover:underline">
                hello@valentine.dev
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
