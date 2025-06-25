import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-6">Privacy Policy</h1>
          <div className="bg-card rounded-xl shadow-md border p-8 prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">Last updated: June 2024</p>

            <h2>Information We Collect</h2>
            <p>
              Applyfit collects only the information necessary to provide our service, such as job descriptions, resume content, and usage analytics. We do not collect sensitive personal data unless you provide it for resume generation.
            </p>

            <h2>How We Use Your Information</h2>
            <ul>
              <li>To generate tailored resumes and cover letters</li>
              <li>To improve our AI and user experience</li>
              <li>To provide customer support</li>
            </ul>

            <h2>Data Storage & Security</h2>
            <p>
              Your data may be temporarily cached in your browser or on our servers for processing. We use industry-standard security measures, but cannot guarantee absolute security.
            </p>
            <p>
              We do not sell, rent, or share your data with third parties for marketing purposes.
            </p>

            <h2>User Rights</h2>
            <p>
              You may request deletion of your data at any time by contacting us through the <Link href="/support" className="text-primary hover:underline">Contact page</Link>.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Applyfit is not intended for children under 16. We do not knowingly collect information from children.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy at any time. Continued use of Applyfit after changes constitutes acceptance of the new policy.
            </p>

            <h2>Contact</h2>
            <p>
              For all privacy inquiries, please use our <Link href="/support" className="text-primary hover:underline">Contact page</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
