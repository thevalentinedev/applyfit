"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { generateATSOptimizedPrompt, extractATSKeywords, type ATSPromptContext } from "@/lib/ats-optimized-prompt"
import { scoreResumeAgainstJD, formatResumeForScoring } from "@/lib/ats-scorer"
import { optimizeResumeForATS, type ATSOptimizationResult } from "@/lib/ats-optimizer"
import type { GeneratedResume } from "./generate-resume"

export interface ATSOptimizedResumeResult {
  success: boolean
  resume: GeneratedResume
  initialScore: number
  finalScore: number
  optimizationResult?: ATSOptimizationResult
  keywordsUsed: string[]
  error?: string
}

export async function generateATSOptimizedResume(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  useGpt4 = true,
  targetScore = 90,
  jobUrl?: string,
): Promise<ATSOptimizedResumeResult> {
  try {
    console.log("🎯 Starting ATS-Optimized Resume Generation...")

    // Get user profile
    const { getUserProfile } = await import("@/lib/dal")
    const userProfile = await getUserProfile()

    if (!userProfile) {
      return {
        success: false,
        resume: {} as GeneratedResume,
        initialScore: 0,
        finalScore: 0,
        keywordsUsed: [],
        error: "User profile is required. Please complete your profile first.",
      }
    }

    // Extract keywords from job description
    console.log("🔍 Extracting ATS keywords from job description...")
    const extractedKeywords = extractATSKeywords(jobDescription)

    console.log("📊 Extracted Keywords:", {
      technicalSkills: extractedKeywords.technicalSkills.length,
      tools: extractedKeywords.tools.length,
      frameworks: extractedKeywords.frameworks.length,
      totalKeywords: Object.values(extractedKeywords).flat().length,
    })

    // Create ATS-optimized prompt context
    const promptContext: ATSPromptContext = {
      jobTitle,
      companyName,
      jobDescription,
      userProfile,
      extractedKeywords,
      targetScore,
    }

    // Generate ATS-optimized prompt
    const atsPrompt = generateATSOptimizedPrompt(promptContext)
    console.log("📝 Generated ATS-optimized prompt (length:", atsPrompt.length, ")")

    // Generate resume with ATS optimization
    const model = useGpt4 ? openai("gpt-4o") : openai("gpt-3.5-turbo")

    console.log("🤖 Generating ATS-optimized resume...")
    const result = await generateText({
      model,
      prompt: atsPrompt,
      temperature: 0.3, // Lower temperature for more consistent ATS optimization
      maxTokens: 3000,
    })

    // Parse the generated resume
    let initialResume: GeneratedResume
    try {
      const cleanedText = result.text.trim()
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response")
      }

      const resumeData = JSON.parse(jsonMatch[0])

      // Track job application
      let applicationId: string | undefined
      try {
        const { findOrCreateJobApplication } = await import("@/lib/dal")
        const jobApplication = await findOrCreateJobApplication({
          company_name: companyName,
          job_title: jobTitle,
          job_link: jobUrl || null,
          job_description: jobDescription,
          resume_generated_at: new Date().toISOString(),
        })
        applicationId = jobApplication.id
      } catch (trackingError) {
        console.error("❌ Failed to create job application:", trackingError)
      }

      initialResume = {
        ...resumeData,
        success: true,
        jobTitle,
        location: userProfile.location || resumeData.location || "Remote",
        applicationId,
      }
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError)
      return {
        success: false,
        resume: {} as GeneratedResume,
        initialScore: 0,
        finalScore: 0,
        keywordsUsed: [],
        error: "Failed to parse AI response. Please try again.",
      }
    }

    // Score the initial resume
    console.log("📊 Scoring initial resume...")
    const resumeText = formatResumeForScoring(initialResume)
    const initialScoreResult = await scoreResumeAgainstJD(resumeText, jobDescription, useGpt4)
    const initialScore = initialScoreResult.score

    console.log(`📈 Initial ATS Score: ${initialScore}/100`)

    // If score is below target, run optimization
    let optimizationResult: ATSOptimizationResult | undefined
    let finalResume = initialResume
    let finalScore = initialScore

    if (initialScore < targetScore) {
      console.log("🔧 Score below target, running optimization...")

      optimizationResult = await optimizeResumeForATS(
        initialResume,
        jobTitle,
        companyName,
        jobDescription,
        userProfile,
        useGpt4,
        targetScore,
        3, // max attempts
      )

      finalResume = optimizationResult.finalResume
      finalScore = optimizationResult.finalScore.score

      console.log(
        `🎯 Final ATS Score: ${finalScore}/100 (${optimizationResult.reachedTarget ? "✅ Target Reached" : "❌ Target Not Reached"})`,
      )
    }

    // Collect all keywords used
    const keywordsUsed = [
      ...extractedKeywords.technicalSkills,
      ...extractedKeywords.tools,
      ...extractedKeywords.frameworks,
    ].slice(0, 20) // Top 20 keywords

    console.log("✅ ATS-Optimized Resume Generation Complete!")

    return {
      success: true,
      resume: finalResume,
      initialScore,
      finalScore,
      optimizationResult,
      keywordsUsed,
    }
  } catch (error) {
    console.error("❌ ATS Resume Generation Error:", error)
    return {
      success: false,
      resume: {} as GeneratedResume,
      initialScore: 0,
      finalScore: 0,
      keywordsUsed: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Helper function to regenerate specific sections with ATS focus
export async function regenerateATSSection(
  sectionType: string,
  resume: GeneratedResume,
  jobDescription: string,
  feedback: string[],
  useGpt4 = true,
): Promise<{ success: boolean; content: any; error?: string }> {
  try {
    const { getUserProfile } = await import("@/lib/dal")
    const userProfile = await getUserProfile()

    if (!userProfile) {
      return { success: false, content: null, error: "User profile required" }
    }

    const extractedKeywords = extractATSKeywords(jobDescription)
    const promptContext: ATSPromptContext = {
      jobTitle: resume.jobTitle,
      companyName: "Company", // Could be extracted from resume
      jobDescription,
      userProfile,
      extractedKeywords,
      targetScore: 90,
    }

    // Get current section content
    let currentContent = ""
    switch (sectionType) {
      case "summary":
        currentContent = resume.summary || ""
        break
      case "skills":
        currentContent = JSON.stringify(resume.skills || {})
        break
      case "experience":
        currentContent = JSON.stringify(resume.experience || [])
        break
      case "projects":
        currentContent = JSON.stringify(resume.projects || [])
        break
    }

    const { generateATSRegenerationPrompt } = await import("@/lib/ats-optimized-prompt")
    const regenerationPrompt = generateATSRegenerationPrompt(sectionType, promptContext, currentContent, feedback)

    const model = useGpt4 ? openai("gpt-4o") : openai("gpt-3.5-turbo")
    const result = await generateText({
      model,
      prompt: regenerationPrompt,
      temperature: 0.3,
      maxTokens: 1000,
    })

    // Parse the result based on section type
    let parsedContent
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0])
      } else {
        // For simple text sections like summary
        parsedContent = result.text.trim()
      }
    } catch {
      parsedContent = result.text.trim()
    }

    return {
      success: true,
      content: parsedContent,
    }
  } catch (error) {
    console.error(`❌ Error regenerating ${sectionType}:`, error)
    return {
      success: false,
      content: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
