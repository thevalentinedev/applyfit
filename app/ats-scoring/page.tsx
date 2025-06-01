import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle, Target, BarChart3, Zap } from "lucide-react"

export default function ATSScoringPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-heading font-bold mb-4">ATS Scoring</h1>
            <p className="text-lg text-muted-foreground">Advanced Applicant Tracking System optimization and scoring</p>
          </div>

          <div className="bg-card rounded-xl shadow-md border p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>

              <h2 className="text-2xl font-heading font-semibold mb-4">Coming Soon</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our ATS Scoring feature is currently in development. This powerful tool will help you optimize your
                resume for Applicant Tracking Systems used by employers worldwide.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-muted/50 rounded-lg p-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">ATS Compatibility Check</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze your resume against common ATS parsing algorithms to ensure maximum compatibility.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <BarChart3 className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Keyword Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Get detailed keyword analysis and suggestions to improve your resume's searchability.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <Zap className="h-8 w-8 text-yellow-500 mb-3" />
                  <h3 className="font-semibold mb-2">Real-time Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive instant feedback and scoring as you make changes to your resume content.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6">
                  <Target className="h-8 w-8 text-purple-500 mb-3" />
                  <h3 className="font-semibold mb-2">Industry-Specific Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Tailored scoring based on your target industry and job role requirements.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Stay Updated:</strong> Be the first to know when ATS Scoring launches. This feature will be
                  seamlessly integrated with your existing resume generation workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
