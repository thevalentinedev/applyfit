"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { ATSScoreFeedback } from "./ats-score-feedback"
import { scoreResumeAgainstJD, formatResumeForScoring, type ATSScoreResult } from "@/lib/ats-scorer"
import { regenerateResumeSection, type BulletGenerationContext } from "@/lib/resume-bullet-generator"
import type { GeneratedResume } from "@/app/actions/generate-resume"

interface ATSOptimizationLoopProps {
  resume: GeneratedResume
  jobDescription: string
  jobTitle: string
  companyName: string
  userProfile: any
  useGpt4: boolean
  onResumeUpdate: (updatedResume: GeneratedResume) => void
}

export function ATSOptimizationLoop({
  resume,
  jobDescription,
  jobTitle,
  companyName,
  userProfile,
  useGpt4,
  onResumeUpdate,
}: ATSOptimizationLoopProps) {
  const { toast } = useToast()
  const [currentScore, setCurrentScore] = useState<ATSScoreResult | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regeneratingSection, setRegeneratingSection] = useState<string>()
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false)
  const [optimizationAttempts, setOptimizationAttempts] = useState(0)
  const [optimizationHistory, setOptimizationHistory] = useState<
    Array<{ score: number; timestamp: Date; changes: string[] }>
  >([])

  // Score the resume on initial load and when resume changes
  useEffect(() => {
    if (resume.success) {
      scoreResume()
    }
  }, [resume])

  const scoreResume = async () => {
    setIsScoring(true)
    try {
      const resumeText = formatResumeForScoring(resume)
      const score = await scoreResumeAgainstJD(resumeText, jobDescription, useGpt4)
      setCurrentScore(score)

      // Track scoring history
      setOptimizationHistory((prev) => [
        ...prev,
        {
          score: score.score,
          timestamp: new Date(),
          changes: score.improvements.slice(0, 2),
        },
      ])

      console.log("🎯 ATS Score Result:", {
        score: score.score,
        targetMet: score.score >= 90,
        breakdown: score.breakdown,
      })
    } catch (error) {
      console.error("❌ Error scoring resume:", error)
      toast({
        title: "Scoring failed",
        description: "Unable to score resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScoring(false)
    }
  }

  const regenerationContext: BulletGenerationContext = {
    jobTitle,
    companyName,
    jobDescription,
    userProfile,
    useGpt4,
  }

  const handleRegenerateSection = async (sectionType: string, focus: string) => {
    setIsRegenerating(true)
    setRegeneratingSection(sectionType)

    try {
      console.log(`🔄 Regenerating ${sectionType} with focus: ${focus}`)

      const newContent = await regenerateResumeSection(
        sectionType as any,
        regenerationContext,
        sectionType === "experience" ? 0 : undefined,
      )

      // Update the resume with new content
      const updatedResume = { ...resume }

      switch (sectionType) {
        case "summary":
          updatedResume.summary = newContent.summary
          break
        case "skills":
          updatedResume.skills = newContent.skills
          break
        case "experience":
          if (updatedResume.experience[0]) {
            updatedResume.experience[0].bullets = newContent.bullets
          }
          break
        case "projects":
          if (updatedResume.projects[0]) {
            updatedResume.projects[0].bullets = newContent.bullets
          }
          break
      }

      onResumeUpdate(updatedResume)

      toast({
        title: "Section regenerated",
        description: `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} has been optimized for better ATS compatibility.`,
        variant: "success",
      })

      // Re-score after regeneration
      setTimeout(() => {
        scoreResume()
      }, 1000)
    } catch (error) {
      console.error(`❌ Error regenerating ${sectionType}:`, error)
      toast({
        title: "Regeneration failed",
        description: `Failed to regenerate ${sectionType}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
      setRegeneratingSection(undefined)
    }
  }

  const handleAutoOptimize = async () => {
    if (!currentScore || optimizationAttempts >= 3) {
      toast({
        title: "Optimization limit reached",
        description: "Maximum optimization attempts reached. Try manual section regeneration.",
        variant: "destructive",
      })
      return
    }

    setIsAutoOptimizing(true)
    setOptimizationAttempts((prev) => prev + 1)

    try {
      console.log("🚀 Starting auto-optimization process...")

      // Determine which sections need the most improvement based on score breakdown
      const sectionsToImprove = []

      if (currentScore.breakdown.keywordMatch < 16) {
        sectionsToImprove.push({ section: "summary", focus: "keyword integration and ATS optimization" })
        sectionsToImprove.push({ section: "skills", focus: "job description alignment and keyword matching" })
      }

      if (currentScore.breakdown.experienceRelevance < 16) {
        sectionsToImprove.push({ section: "experience", focus: "role relevance and quantified achievements" })
      }

      if (currentScore.breakdown.clarityUniqueness < 16) {
        sectionsToImprove.push({ section: "experience", focus: "action verb variety and unique accomplishments" })
      }

      // If no specific issues, improve all sections
      if (sectionsToImprove.length === 0) {
        sectionsToImprove.push(
          { section: "summary", focus: "ATS keyword optimization" },
          { section: "skills", focus: "job description alignment" },
          { section: "experience", focus: "achievement quantification" },
        )
      }

      // Regenerate sections sequentially
      for (const { section, focus } of sectionsToImprove.slice(0, 2)) {
        // Limit to 2 sections per auto-optimize
        await handleRegenerateSection(section, focus)
        // Small delay between regenerations
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      toast({
        title: "Auto-optimization complete",
        description: `Optimized ${sectionsToImprove.length} sections. Checking new ATS score...`,
        variant: "success",
      })
    } catch (error) {
      console.error("❌ Auto-optimization error:", error)
      toast({
        title: "Auto-optimization failed",
        description: "Please try regenerating individual sections manually.",
        variant: "destructive",
      })
    } finally {
      setIsAutoOptimizing(false)
    }
  }

  if (isScoring && !currentScore) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing ATS compatibility...</p>
        </div>
      </div>
    )
  }

  if (!currentScore) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Unable to score resume. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ATSScoreFeedback
        score={currentScore}
        onRegenerateSection={handleRegenerateSection}
        isRegenerating={isRegenerating}
        regeneratingSection={regeneratingSection}
        onAutoOptimize={handleAutoOptimize}
        isAutoOptimizing={isAutoOptimizing}
      />

      {/* Optimization History */}
      {optimizationHistory.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Optimization Progress</h4>
          <div className="flex items-center gap-4 text-sm">
            {optimizationHistory.slice(-3).map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${entry.score >= 90 ? "bg-green-500" : entry.score >= 75 ? "bg-yellow-500" : "bg-red-500"}`}
                />
                <span className="font-medium">{entry.score}/100</span>
                {index < optimizationHistory.slice(-3).length - 1 && <span className="text-blue-600">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
