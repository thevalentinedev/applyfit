import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface ATSScoreResult {
  score: number
  feedback: string[]
  breakdown: {
    keywordMatch: number
    experienceRelevance: number
    formatCompatibility: number
    sectionCompleteness: number
    clarityUniqueness: number
  }
  improvements: string[]
}

export async function scoreResumeAgainstJD(
  resume: string,
  jobDescription: string,
  useGpt4 = true,
): Promise<ATSScoreResult> {
  const model = useGpt4 ? openai("gpt-4o") : openai("gpt-3.5-turbo")

  try {
    const { text } = await generateText({
      model,
      prompt: `You are simulating an advanced ATS scoring engine used by Fortune 500 companies. Analyze this resume against the job description and provide a comprehensive ATS compatibility score.

SCORING CRITERIA (Each worth 20 points, total 100):

1. KEYWORD MATCH (0-20): How well do resume terms match JD terms?
   - Technical skills, tools, frameworks mentioned in JD
   - Industry-specific terminology and buzzwords
   - Action verbs that align with job requirements

2. EXPERIENCE RELEVANCE (0-20): Does background align with role?
   - Years of experience match requirements
   - Previous roles relate to target position
   - Industry experience alignment

3. FORMAT COMPATIBILITY (0-20): Is resume ATS-parsable?
   - Clean section headers (Summary, Experience, Skills, Education)
   - No tables, images, or complex formatting
   - Consistent date formats and structure

4. SECTION COMPLETENESS (0-20): Are all expected sections present?
   - Professional summary with keywords
   - Work experience with quantified achievements
   - Technical skills section
   - Education (if required)
   - Contact information

5. CLARITY & UNIQUENESS (0-20): Quality of content
   - Unique action verbs (no repetition)
   - Quantified achievements with metrics
   - Clear, specific accomplishments
   - No generic filler content

RESUME TO ANALYZE:
${resume}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON in this exact format:
{
  "score": <total_score_0_to_100>,
  "feedback": [
    "Primary strength or weakness 1",
    "Primary strength or weakness 2", 
    "Primary strength or weakness 3"
  ],
  "breakdown": {
    "keywordMatch": <score_0_to_20>,
    "experienceRelevance": <score_0_to_20>,
    "formatCompatibility": <score_0_to_20>,
    "sectionCompleteness": <score_0_to_20>,
    "clarityUniqueness": <score_0_to_20>
  },
  "improvements": [
    "Specific actionable improvement 1",
    "Specific actionable improvement 2",
    "Specific actionable improvement 3"
  ]
}`,
      temperature: 0.2,
      maxTokens: 1000,
    })

    console.log("🎯 ATS Scorer - Raw AI Response:", text.substring(0, 200) + "...")

    // Extract and parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in ATS scoring response")
    }

    const result = JSON.parse(jsonMatch[0]) as ATSScoreResult

    // Validate the result structure
    if (
      typeof result.score !== "number" ||
      !Array.isArray(result.feedback) ||
      !result.breakdown ||
      !Array.isArray(result.improvements)
    ) {
      throw new Error("Invalid ATS score result structure")
    }

    // Ensure score is within bounds
    result.score = Math.max(0, Math.min(100, result.score))

    console.log("✅ ATS Scorer - Final Score:", {
      totalScore: result.score,
      breakdown: result.breakdown,
      feedbackCount: result.feedback.length,
      improvementsCount: result.improvements.length,
    })

    return result
  } catch (error) {
    console.error("❌ ATS Scorer - Error:", error)

    // Return fallback score
    return {
      score: 0,
      feedback: [
        "Failed to analyze resume against job description",
        "Please try again or contact support",
        "Ensure resume content is properly formatted",
      ],
      breakdown: {
        keywordMatch: 0,
        experienceRelevance: 0,
        formatCompatibility: 0,
        sectionCompleteness: 0,
        clarityUniqueness: 0,
      },
      improvements: [
        "Unable to generate specific improvements at this time",
        "Please regenerate the resume and try scoring again",
        "Consider reviewing job description for key requirements",
      ],
    }
  }
}

// Helper function to format resume content for scoring
export function formatResumeForScoring(resume: any): string {
  if (typeof resume === "string") {
    return resume
  }

  // Format structured resume data into text for ATS analysis
  const sections = []

  // Header/Contact Info
  if (resume.candidateInfo) {
    sections.push(`CONTACT INFORMATION:
Name: ${resume.candidateInfo.name || "Not provided"}
Email: ${resume.candidateInfo.email || "Not provided"}
Phone: ${resume.candidateInfo.phone || "Not provided"}
Location: ${resume.location || "Not provided"}
Website: ${resume.candidateInfo.website || "Not provided"}
LinkedIn: ${resume.candidateInfo.linkedin || "Not provided"}
GitHub: ${resume.candidateInfo.github || "Not provided"}`)
  }

  // Professional Summary
  if (resume.summary) {
    sections.push(`PROFESSIONAL SUMMARY:
${resume.summary}`)
  }

  // Technical Skills
  if (resume.skills && typeof resume.skills === "object") {
    sections.push(`TECHNICAL SKILLS:`)
    Object.entries(resume.skills).forEach(([category, skills]) => {
      if (Array.isArray(skills)) {
        sections.push(`${category}: ${skills.join(", ")}`)
      }
    })
  }

  // Professional Experience
  if (resume.experience && Array.isArray(resume.experience)) {
    sections.push(`PROFESSIONAL EXPERIENCE:`)
    resume.experience.forEach((exp: any) => {
      sections.push(`${exp.title || "Position"} | ${exp.period || "Dates"}`)
      if (exp.bullets && Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet: string) => {
          sections.push(`• ${bullet}`)
        })
      }
    })
  }

  // Projects
  if (resume.projects && Array.isArray(resume.projects)) {
    sections.push(`SELECTED PROJECTS:`)
    resume.projects.forEach((project: any) => {
      sections.push(`${project.title || "Project"} | ${project.period || "Dates"}`)
      if (project.bullets && Array.isArray(project.bullets)) {
        project.bullets.forEach((bullet: string) => {
          sections.push(`• ${bullet}`)
        })
      }
    })
  }

  return sections.join("\n\n")
}

// Helper function to determine if score meets target
export function meetsATSTarget(score: number, target = 90): boolean {
  return score >= target
}

// Helper function to get score color for UI
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 75) return "text-yellow-600"
  if (score >= 60) return "text-orange-600"
  return "text-red-600"
}

// Helper function to get score badge variant
export function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 90) return "default" // Green
  if (score >= 75) return "secondary" // Yellow
  return "destructive" // Red
}
