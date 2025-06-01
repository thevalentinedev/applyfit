import { JobUrlForm } from "@/components/job-url-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
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
            <JobUrlForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
