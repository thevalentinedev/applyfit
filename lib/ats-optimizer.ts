import { scoreResumeAgainstJD, formatResumeForScoring, type ATSScoreResult } from "./ats-scorer"
import { regenerateResumeSection, type BulletGenerationContext, type SectionType } from "./resume-bullet-generator"
import type { GeneratedResume } from "@/app/actions/generate-resume"

export interface ATSOptimizationResult {
  finalResume: GeneratedResume
  finalScore: ATSScoreResult
  optimizationSteps: Array<{
    section: SectionType
    beforeScore: number
    afterScore: number
    improvements: string[]
  }>
  totalAttempts: number
  reachedTarget: boolean
}

export interface OptimizationSuggestion {
  section: SectionType
  priority: "high" | "medium" | "low"
  reason: string
  action: string
  expectedImprovement: number
}

// Main ATS optimization engine
export async function optimizeResumeForATS(
  resume: GeneratedResume,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  userProfile: any,
  useGpt4 = true,
  targetScore = 90,
  maxAttempts = 3,
): Promise<ATSOptimizationResult> {
  console.log("🎯 Starting ATS Optimization Process...")

  let currentResume = { ...resume }
  let currentScore: ATSScoreResult
  const optimizationSteps: ATSOptimizationResult["optimizationSteps"] = []
  let attempts = 0

  // Initial scoring
  const resumeText = formatResumeForScoring(currentResume)
  currentScore = await scoreResumeAgainstJD(resumeText, jobDescription, useGpt4)

  console.log(`📊 Initial ATS Score: ${currentScore.score}/100`)

  // If already meets target, return early
  if (currentScore.score >= targetScore) {
    console.log("✅ Resume already meets ATS target!")
    return {
      finalResume: currentResume,
      finalScore: currentScore,
      optimizationSteps: [],
      totalAttempts: 0,
      reachedTarget: true,
    }
  }

  // Optimization loop
  while (currentScore.score < targetScore && attempts < maxAttempts) {
    attempts++
    console.log(`🔄 Optimization Attempt ${attempts}/${maxAttempts}`)

    // Get optimization suggestions based on current score
    const suggestions = generateOptimizationSuggestions(currentScore, jobDescription)
    console.log(`💡 Generated ${suggestions.length} optimization suggestions`)

    // Apply the highest priority suggestion
    const topSuggestion = suggestions[0]
    if (!topSuggestion) {
      console.log("⚠️ No optimization suggestions available")
      break
    }

    console.log(`🎯 Applying suggestion: ${topSuggestion.action} (${topSuggestion.section})`)

    const beforeScore = currentScore.score

    // Regenerate the suggested section
    try {
      const context: BulletGenerationContext = {
        jobTitle,
        companyName,
        jobDescription,
        userProfile,
        useGpt4,
      }

      const regeneratedSection = await regenerateResumeSection(topSuggestion.section, context)

      // Apply the regenerated section to the resume
      currentResume = applyRegeneratedSection(currentResume, topSuggestion.section, regeneratedSection)

      // Re-score the updated resume
      const updatedResumeText = formatResumeForScoring(currentResume)
      currentScore = await scoreResumeAgainstJD(updatedResumeText, jobDescription, useGpt4)

      const afterScore = currentScore.score
      const improvement = afterScore - beforeScore

      console.log(`📈 Score improvement: ${beforeScore} → ${afterScore} (+${improvement})`)

      // Track optimization step
      optimizationSteps.push({
        section: topSuggestion.section,
        beforeScore,
        afterScore,
        improvements: currentScore.improvements.slice(0, 2), // Top 2 improvements
      })

      // If score didn't improve significantly, try next suggestion
      if (improvement < 2 && suggestions.length > 1) {
        console.log("⚠️ Minimal improvement, trying alternative approach...")
        // Could implement fallback logic here
      }
    } catch (error) {
      console.error(`❌ Failed to regenerate ${topSuggestion.section}:`, error)
      break
    }
  }

  const reachedTarget = currentScore.score >= targetScore

  console.log(`🏁 Optimization Complete:`)
  console.log(`   Final Score: ${currentScore.score}/100`)
  console.log(`   Target Reached: ${reachedTarget ? "✅" : "❌"}`)
  console.log(`   Total Attempts: ${attempts}`)

  return {
    finalResume: currentResume,
    finalScore: currentScore,
    optimizationSteps,
    totalAttempts: attempts,
    reachedTarget,
  }
}

// Generate optimization suggestions based on ATS score breakdown
export function generateOptimizationSuggestions(
  scoreResult: ATSScoreResult,
  jobDescription: string,
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []
  const { breakdown, feedback, improvements } = scoreResult

  // Analyze each scoring category and suggest improvements
  if (breakdown.keywordMatch < 15) {
    suggestions.push({
      section: "skills",
      priority: "high",
      reason: `Keyword match score is low (${breakdown.keywordMatch}/20)`,
      action: "Add more job-relevant technical skills and tools",
      expectedImprovement: 8,
    })

    suggestions.push({
      section: "summary",
      priority: "high",
      reason: "Summary lacks job-specific keywords",
      action: "Incorporate key terms from job description into summary",
      expectedImprovement: 6,
    })
  }

  if (breakdown.experienceRelevance < 15) {
    suggestions.push({
      section: "experience",
      priority: "high",
      reason: `Experience relevance is low (${breakdown.experienceRelevance}/20)`,
      action: "Rewrite experience bullets to better align with job requirements",
      expectedImprovement: 10,
    })
  }

  if (breakdown.clarityUniqueness < 15) {
    suggestions.push({
      section: "experience",
      priority: "medium",
      reason: `Content clarity needs improvement (${breakdown.clarityUniqueness}/20)`,
      action: "Enhance bullets with unique action verbs and quantified results",
      expectedImprovement: 7,
    })

    suggestions.push({
      section: "projects",
      priority: "medium",
      reason: "Project descriptions lack specificity",
      action: "Add more technical details and measurable outcomes to projects",
      expectedImprovement: 5,
    })
  }

  if (breakdown.sectionCompleteness < 18) {
    suggestions.push({
      section: "summary",
      priority: "medium",
      reason: `Missing key resume sections (${breakdown.sectionCompleteness}/20)`,
      action: "Ensure all critical sections are comprehensive and well-structured",
      expectedImprovement: 4,
    })
  }

  // Sort by priority and expected improvement
  return suggestions.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    return b.expectedImprovement - a.expectedImprovement
  })
}

// Apply regenerated section to resume
function applyRegeneratedSection(
  resume: GeneratedResume,
  sectionType: SectionType,
  regeneratedContent: any,
): GeneratedResume {
  const updatedResume = { ...resume }

  switch (sectionType) {
    case "summary":
      if (regeneratedContent.summary) {
        updatedResume.summary = regeneratedContent.summary
      }
      break

    case "skills":
      if (regeneratedContent.skills) {
        updatedResume.skills = { ...updatedResume.skills, ...regeneratedContent.skills }
      }
      break

    case "experience":
      if (regeneratedContent.bullets && Array.isArray(regeneratedContent.bullets)) {
        // Apply to first experience entry (could be made more sophisticated)
        if (updatedResume.experience && updatedResume.experience.length > 0) {
          updatedResume.experience[0] = {
            ...updatedResume.experience[0],
            bullets: regeneratedContent.bullets,
          }
        }
      }
      break

    case "projects":
      if (regeneratedContent.bullets && Array.isArray(regeneratedContent.bullets)) {
        // Apply to first project entry
        if (updatedResume.projects && updatedResume.projects.length > 0) {
          updatedResume.projects[0] = {
            ...updatedResume.projects[0],
            bullets: regeneratedContent.bullets,
          }
        }
      }
      break
  }

  return updatedResume
}

// Helper function to extract keywords from job description
export function extractJobKeywords(jobDescription: string): {
  technicalSkills: string[]
  tools: string[]
  frameworks: string[]
  softSkills: string[]
  requirements: string[]
} {
  const text = jobDescription.toLowerCase()

  // Common technical skills patterns
  const technicalSkills = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "node.js",
    "sql",
    "html",
    "css",
    "git",
  ].filter((skill) => text.includes(skill))

  // Common tools and platforms
  const tools = ["aws", "docker", "kubernetes", "jenkins", "jira", "figma", "github", "gitlab"].filter((tool) =>
    text.includes(tool),
  )

  // Common frameworks
  const frameworks = ["next.js", "express", "django", "spring", "angular", "vue", "tailwind"].filter((framework) =>
    text.includes(framework),
  )

  // Soft skills
  const softSkills = [
    "leadership",
    "communication",
    "collaboration",
    "problem-solving",
    "analytical",
    "creative",
  ].filter((skill) => text.includes(skill))

  // Extract requirements (simplified)
  const requirements = []
  if (text.includes("bachelor") || text.includes("degree")) requirements.push("Bachelor's degree")
  if (text.includes("experience")) requirements.push("Relevant experience")
  if (text.includes("remote")) requirements.push("Remote work capability")

  return {
    technicalSkills,
    tools,
    frameworks,
    softSkills,
    requirements,
  }
}
