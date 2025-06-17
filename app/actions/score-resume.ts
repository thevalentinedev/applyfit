"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { formatResumeForScoring } from "../../lib/formatResumeForScoring";

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
      prompt: `You are a BRUTAL and REALISTIC ATS scoring engine used by top-tier companies like Google, Microsoft, and Goldman Sachs. You are extremely strict and rarely give high scores. Most resumes score between 40-70. Only exceptional resumes score 80+.

BE HARSH AND REALISTIC. Most candidates are NOT qualified. Look for REAL problems.

SCORING CRITERIA (Each worth 20 points, total 100):

1. KEYWORD MATCH (0-20): STRICT keyword analysis
   - Deduct points for missing critical JD keywords
   - Deduct points for generic skills not in JD
   - Only award high scores if 80%+ of JD keywords are present
   - Typical scores: 8-14 (most resumes miss key terms)

2. EXPERIENCE RELEVANCE (0-20): BRUTAL experience evaluation
   - Deduct heavily if experience doesn't directly match role
   - Deduct for junior experience applying to senior roles
   - Deduct for career gaps or job hopping
   - Typical scores: 10-16 (most candidates lack perfect fit)

3. FORMAT COMPATIBILITY (0-20): Technical ATS parsing
   - Deduct for poor formatting, inconsistent dates
   - Deduct for missing contact info or unclear sections
   - Deduct for overly creative formatting
   - Typical scores: 15-18 (most resumes have minor issues)

4. SECTION COMPLETENESS (0-20): Missing critical sections
   - Deduct heavily for missing summary, skills, or experience
   - Deduct for weak or generic content
   - Deduct for missing quantified achievements
   - Typical scores: 12-17 (most resumes lack depth)

5. CLARITY & UNIQUENESS (0-20): Content quality analysis
   - Deduct heavily for repeated action verbs
   - Deduct for generic bullets without metrics
   - Deduct for unclear or vague accomplishments
   - Typical scores: 8-15 (most bullets are generic)

RESUME TO ANALYZE:
${resume}

JOB DESCRIPTION:
${jobDescription}

BE EXTREMELY CRITICAL. Find every flaw. Most resumes should score 45-65. Only truly exceptional resumes score 75+.

Return ONLY valid JSON:

{
  "score": 52,
  "feedback": [
    "Missing critical keywords from job description",
    "Experience bullets lack quantified metrics and impact",
    "Generic action verbs repeated throughout resume"
  ],
  "breakdown": {
    "keywordMatch": 8,
    "experienceRelevance": 12,
    "formatCompatibility": 16,
    "sectionCompleteness": 11,
    "clarityUniqueness": 5
  },
  "improvements": [
    "Add specific technologies mentioned in job description: React, Node.js, AWS",
    "Quantify all achievements with specific numbers and percentages",
    "Replace generic verbs like 'worked on' with strong action verbs like 'architected' or 'optimized'"
  ]
}`,
      temperature: 0.1, // Lower temperature for more consistent harsh scoring
      maxTokens: 1200,
    })

    console.log("🎯 ATS Scorer - Raw AI Response:", text.substring(0, 200) + "...")

    // Clean and extract JSON more robustly
    let jsonText = text.trim()

    // Remove any markdown code blocks
    jsonText = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "")

    // Find JSON object boundaries
    const startIndex = jsonText.indexOf("{")
    const lastIndex = jsonText.lastIndexOf("}")

    if (startIndex === -1 || lastIndex === -1) {
      throw new Error("No valid JSON object found in response")
    }

    jsonText = jsonText.substring(startIndex, lastIndex + 1)

    // Remove any trailing commas before closing brackets/braces
    jsonText = jsonText.replace(/,(\s*[}\]])/g, "$1")

    console.log("🔧 Cleaned JSON text:", jsonText.substring(0, 200) + "...")

    const result = JSON.parse(jsonText) as ATSScoreResult

    // Validate the result structure
    if (
      typeof result.score !== "number" ||
      !Array.isArray(result.feedback) ||
      !result.breakdown ||
      !Array.isArray(result.improvements)
    ) {
      throw new Error("Invalid ATS score result structure")
    }

    // Ensure score is within bounds and realistic (cap at 95 to be brutal)
    result.score = Math.max(0, Math.min(95, result.score))

    // Ensure breakdown scores are realistic and add up properly
    const breakdownTotal = Object.values(result.breakdown).reduce((sum, score) => sum + score, 0)
    if (Math.abs(breakdownTotal - result.score) > 5) {
      // Adjust breakdown to match total score if there's a significant discrepancy
      const ratio = result.score / breakdownTotal
      Object.keys(result.breakdown).forEach((key) => {
        result.breakdown[key as keyof typeof result.breakdown] = Math.round(
          result.breakdown[key as keyof typeof result.breakdown] * ratio,
        )
      })
    }

    console.log("✅ ATS Scorer - Final Score:", {
      totalScore: result.score,
      breakdown: result.breakdown,
      feedbackCount: result.feedback.length,
      improvementsCount: result.improvements.length,
    })

    return result
  } catch (error) {
    console.error("❌ ATS Scorer - Error:", error)

    // Return realistic fallback score (not 0, but low)
    return {
      score: 35,
      feedback: [
        "Unable to properly analyze resume due to technical error",
        "Resume may have formatting issues preventing ATS parsing",
        "Consider regenerating resume with cleaner structure",
      ],
      breakdown: {
        keywordMatch: 5,
        experienceRelevance: 8,
        formatCompatibility: 10,
        sectionCompleteness: 7,
        clarityUniqueness: 5,
      },
      improvements: [
        "Ensure resume has clear section headers and consistent formatting",
        "Add more specific keywords from the job description",
        "Include quantified achievements with specific metrics and numbers",
      ],
    }
  }
}

// Helper function to format resume content for scoring


// Server Action wrapper for the component
export async function scoreResumeAction(resume: any, jobDescription: string, useGpt4 = true): Promise<ATSScoreResult> {
  const resumeText = formatResumeForScoring(resume)
  return await scoreResumeAgainstJD(resumeText, jobDescription, useGpt4)
}
