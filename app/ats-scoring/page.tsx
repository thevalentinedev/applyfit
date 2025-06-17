import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle, Target, BarChart3, Zap, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ATSScoringPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <CheckCircle className="h-4 w-4" />
              Now Live
            </div>
            <h1 className="text-4xl font-heading font-bold mb-4">ATS Scoring & Optimization</h1>
            <p className="text-lg text-muted-foreground">
              Advanced Applicant Tracking System optimization with real-time scoring and AI-powered improvements
            </p>
          </div>

          {/* Hero Demo Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-8 mb-12 border">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-semibold mb-4">See ATS Scoring in Action</h2>
              <p className="text-muted-foreground mb-6">
                Generate a resume and get instant ATS compatibility scoring with detailed feedback and optimization
                suggestions.
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Try ATS Scoring Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Sample ATS Score Display */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md mx-auto border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">ATS Compatibility Score</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">Live Demo</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-orange-600">72</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
              <div className="text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded">Good - Room for improvement</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card rounded-xl shadow-md border p-6">
              <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
              <h3 className="font-semibold mb-3">Real-time ATS Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant compatibility scores as you build your resume, with detailed breakdowns of keyword matching,
                format compatibility, and section completeness.
              </p>
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                ✓ Live scoring • ✓ Instant feedback • ✓ Format validation
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-md border p-6">
              <BarChart3 className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-3">Smart Keyword Optimization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered analysis matches your resume against job descriptions, identifying missing keywords and
                suggesting strategic improvements.
              </p>
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                ✓ Job matching • ✓ Keyword analysis • ✓ Strategic suggestions
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-md border p-6">
              <Zap className="h-8 w-8 text-yellow-500 mb-4" />
              <h3 className="font-semibold mb-3">One-Click Optimization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Auto-optimize your entire resume or individual sections with AI-powered improvements that boost your ATS
                score significantly.
              </p>
              <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                ✓ Auto-optimize • ✓ Section targeting • ✓ Score improvement
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-md border p-6">
              <Target className="h-8 w-8 text-purple-500 mb-4" />
              <h3 className="font-semibold mb-3">Industry-Specific Scoring</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tailored analysis based on your target industry and role, ensuring your resume meets specific ATS
                requirements and expectations.
              </p>
              <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                ✓ Industry focus • ✓ Role-specific • ✓ ATS requirements
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-card rounded-xl shadow-md border p-8">
            <h2 className="text-2xl font-heading font-semibold mb-6 text-center">How ATS Scoring Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Generate Resume</h3>
                <p className="text-sm text-muted-foreground">
                  Create your resume using our AI-powered generator with job description matching
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Get ATS Score</h3>
                <p className="text-sm text-muted-foreground">
                  Receive instant compatibility scoring with detailed feedback and improvement areas
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Optimize & Improve</h3>
                <p className="text-sm text-muted-foreground">
                  Use one-click optimization or manual edits to boost your score and ATS compatibility
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
            <h2 className="text-2xl font-heading font-bold mb-4">Ready to Optimize Your Resume?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of job seekers who have improved their ATS compatibility and landed more interviews with
              our advanced scoring system.
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                Start ATS Optimization
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
