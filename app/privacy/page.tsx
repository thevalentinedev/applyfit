import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-6">Privacy Policy</h1>
          <div className="bg-card rounded-xl shadow-md border p-8 prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">Last updated: January 2025</p>

            <h2>Information We Collect</h2>
            <p>
              Applyfit is designed with privacy in mind. We collect minimal information necessary to provide our
              service:
            </p>
            <ul>
              <li>Job descriptions you provide for resume tailoring</li>
              <li>Resume content you input or generate</li>
              <li>Usage analytics to improve our service</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>Your information is used solely to:</p>
            <ul>
              <li>Generate tailored resumes and cover letters</li>
              <li>Improve our AI algorithms</li>
              <li>Provide customer support</li>
            </ul>

            <h2>Data Storage</h2>
            <p>
              Your data is temporarily cached in your browser for convenience. We do not permanently store your personal
              resume information on our servers.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
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
