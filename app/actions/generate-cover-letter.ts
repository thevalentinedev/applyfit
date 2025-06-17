"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { analyzeTone, getTonePromptGuidance, type ToneType } from "@/lib/tone-analyzer"

export type GeneratedCoverLetter = {
  location: string
  date: string
  recipient: {
    name: string
    company: string
    location: string
  }
  greeting: string
  body: {
    hook: string
    skills: string
    closing: string
  }
  success: boolean
  error?: string
  toneUsed?: ToneType
  qualityScore?: number
  companyMission?: string
}

// NEW: Extract company mission using AI
async function extractCompanyMission(jobDescription: string, companyName: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Analyze this job description and extract ${companyName}'s mission, vision, or core purpose in ONE clear sentence.

Job Description:
${jobDescription}

Look for:
- Company mission statements
- Vision statements  
- Core values or purpose
- What the company is trying to achieve
- Impact they want to make

Return ONLY the mission statement as a single sentence, no extra text. If no clear mission is found, return "No specific mission identified".

Examples:
- "Airbnb's mission is to create a world where anyone can belong anywhere"
- "Tesla's mission is to accelerate the world's transition to sustainable energy"
- "Stripe's mission is to increase the GDP of the internet"`,
      temperature: 0.2,
      maxTokens: 100,
    })

    const mission = text.trim()
    return mission === "No specific mission identified" ? "" : mission
  } catch (error) {
    console.error("Mission extraction error:", error)
    return ""
  }
}

// NEW: Extract recipient information from job posting
function extractRecipientInfo(
  jobDescription: string,
  jobLocation: string,
): {
  name: string
  location: string
} {
  const text = jobDescription.toLowerCase()

  // Try to find hiring manager or recruiter names
  const namePatterns = [
    /hiring manager[:\s]+([a-z\s]+?)(?:\n|,|\.|\s{2,})/i,
    /contact[:\s]+([a-z\s]+?)(?:\n|,|\.|\s{2,})/i,
    /recruiter[:\s]+([a-z\s]+?)(?:\n|,|\.|\s{2,})/i,
    /reach out to[:\s]+([a-z\s]+?)(?:\n|,|\.|\s{2,})/i,
    /questions\? contact[:\s]+([a-z\s]+?)(?:\n|,|\.|\s{2,})/i,
    /dear\s+([a-z\s]+?)(?:\n|,|\.)/i,
  ]

  let recipientName = "Hiring Team"

  for (const pattern of namePatterns) {
    const match = jobDescription.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      // Validate it's a reasonable name (2-4 words, proper length)
      const words = name.split(/\s+/)
      if (words.length >= 2 && words.length <= 4 && name.length <= 50) {
        // Capitalize properly
        recipientName = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
        break
      }
    }
  }

  // Extract location - prefer job location, fallback to company location from JD
  let location = jobLocation || "Remote"

  if (!jobLocation || jobLocation.toLowerCase() === "remote") {
    const locationPatterns = [
      /location[:\s]+([^,\n]+)/i,
      /based in[:\s]+([^,\n]+)/i,
      /office[:\s]+([^,\n]+)/i,
      /headquarters[:\s]+([^,\n]+)/i,
    ]

    for (const pattern of locationPatterns) {
      const match = jobDescription.match(pattern)
      if (match && match[1]) {
        const extractedLocation = match[1].trim()
        if (extractedLocation.length <= 50 && !extractedLocation.toLowerCase().includes("remote")) {
          location = extractedLocation
          break
        }
      }
    }
  }

  return {
    name: recipientName,
    location: location,
  }
}

// New: Tone validation function
async function validateToneAlignment(
  coverLetterText: string,
  targetTone: ToneType,
  companyTraits: string[],
): Promise<{ passed: boolean; feedback: string }> {
  try {
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Analyze this cover letter text and determine if it matches a "${targetTone}" tone for a company with these traits: ${companyTraits.join(
        ", ",
      )}.

Cover letter text:
${coverLetterText}

Return a JSON object with:
1. "passed": boolean (true if tone matches, false if not)
2. "feedback": string with brief explanation
3. "confidence": number between 0-1

Format: { "passed": true/false, "feedback": "explanation", "confidence": 0.95 }`,
      temperature: 0.2,
      maxTokens: 300,
    })

    try {
      const result = JSON.parse(text)
      return {
        passed: result.passed,
        feedback: result.feedback,
      }
    } catch (e) {
      console.error("Failed to parse tone validation result:", e)
      return { passed: true, feedback: "Tone validation parsing failed, proceeding anyway" }
    }
  } catch (e) {
    console.error("Tone validation error:", e)
    return { passed: true, feedback: "Tone validation failed, proceeding anyway" }
  }
}

// New: Quality validation function
async function scoreCoverLetterQuality(
  coverLetterText: string,
  jobDescription: string,
): Promise<{ score: number; feedback: string[] }> {
  try {
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Score this cover letter against the job description on a scale of 0-100.

SCORING CRITERIA:
1. Relevance to job requirements (0-25)
2. Specificity and metrics (0-25)
3. Personalization to company (0-25)
4. Professional tone and clarity (0-25)

COVER LETTER:
${coverLetterText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON in this format:
{
  "score": 85,
  "breakdown": {
    "relevance": 22,
    "specificity": 18,
    "personalization": 20,
    "professionalism": 25
  },
  "feedback": [
    "Specific feedback point 1",
    "Specific feedback point 2",
    "Specific feedback point 3"
  ]
}`,
      temperature: 0.2,
      maxTokens: 500,
    })

    try {
      const result = JSON.parse(text)
      return {
        score: result.score,
        feedback: result.feedback,
      }
    } catch (e) {
      console.error("Failed to parse quality validation result:", e)
      return { score: 75, feedback: ["Quality validation parsing failed"] }
    }
  } catch (e) {
    console.error("Quality validation error:", e)
    return { score: 75, feedback: ["Quality validation failed"] }
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  resumeData: {
    summary: string
    skills: { [category: string]: string[] }
    experience: Array<{ title: string; bullets: string[] }>
    projects: Array<{ title: string; bullets: string[] }>
    candidateInfo?: {
      name?: string
      email?: string
      phone?: string
      location?: string
      website?: string
      linkedin?: string
      github?: string
    }
  },
  useGpt4 = false,
  selectedTone: ToneType | "auto" = "auto",
  jobLocation?: string,
  customRecipient?: string,
): Promise<GeneratedCoverLetter> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.")
    }

    // Extract candidate name dynamically from resume data
    const candidateName = resumeData.candidateInfo?.name || "the candidate"

    // Analyze tone from job description
    const toneAnalysis = analyzeTone(jobDescription)
    const finalTone = selectedTone === "auto" ? toneAnalysis.detectedTone : selectedTone

    // Get tone-specific guidance
    const toneGuidance = getTonePromptGuidance(finalTone, toneAnalysis.companyTraits)

    // NEW: Extract company mission using AI
    const companyMission = await extractCompanyMission(jobDescription, companyName)

    // NEW: Extract recipient information
    const recipientInfo = customRecipient
      ? { name: customRecipient, location: jobLocation || "Remote" }
      : extractRecipientInfo(jobDescription, jobLocation || "Remote")

    // Get current date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Create a condensed version of the resume data to save tokens
    const skillsHighlights = Object.entries(resumeData.skills)
      .flatMap(([category, skills]) => skills.slice(0, 3))
      .slice(0, 8)
      .join(", ")

    // Get more specific experience highlights with metrics
    const experienceHighlights = resumeData.experience
      .slice(0, 2)
      .flatMap((exp) =>
        exp.bullets.filter(
          (bullet) => bullet.includes("%") || bullet.includes("increase") || bullet.includes("improve"),
        ),
      )
      .slice(0, 2)
      .join(" ")

    // Enhanced prompt with mission and recipient context
    const prompt = `You are an expert cover letter writer specializing in tech industry applications. Write a compelling, personalized cover letter for ${candidateName} applying for "${jobTitle}" at ${companyName}.

RECIPIENT: ${recipientInfo.name}
LOCATION: ${recipientInfo.location}

TONE & STYLE: ${toneGuidance}

COMPANY TRAITS: ${toneAnalysis.companyTraits.join(", ") || "Professional environment"}

${companyMission ? `COMPANY MISSION: ${companyMission}` : ""}

CANDIDATE HIGHLIGHTS:
- Summary: ${resumeData.summary}
- Key Skills: ${skillsHighlights}
- Experience: ${experienceHighlights}

JOB REQUIREMENTS (Key excerpts):
${jobDescription.substring(0, 1500)}

INSTRUCTIONS:
1. Write in ${finalTone} tone that matches the company culture
2. Keep it concise (150-200 words total)
3. Connect the candidate's experience to specific job requirements
4. ${companyMission ? `Reference the company mission: "${companyMission}"` : "Show genuine enthusiasm for the company"}
5. Address the recipient appropriately (${recipientInfo.name})
6. End with a strong call-to-action

SKILLS PARAGRAPH MUST INCLUDE:
- One technical achievement with measurable results (numbers/percentages)
- One team/leadership achievement showing impact
- Direct mention of at least one technology/skill from the job description
- Avoid generic statements without specifics

CRITICAL: Return ONLY valid JSON in this exact format with no additional text:

{
  "location": "${recipientInfo.location}",
  "date": "${currentDate}",
  "recipient": {
    "name": "${recipientInfo.name}",
    "company": "${companyName}",
    "location": "${recipientInfo.location}"
  },
  "greeting": "Dear ${recipientInfo.name},",
  "body": {
    "hook": "Opening sentence connecting to company mission or role",
    "skills": "2-3 sentences highlighting relevant skills and achievements with metrics",
    "closing": "Strong closing with call-to-action"
  }
}`

    const { text } = await generateText({
      model: openai(useGpt4 ? "gpt-4o" : "gpt-3.5-turbo"),
      prompt,
      temperature: 0.3,
      maxTokens: 800,
    })

    // Enhanced JSON parsing with multiple fallback strategies
    let coverLetterData
    try {
      // Strategy 1: Direct JSON parse
      const cleanedText = text.trim()
      coverLetterData = JSON.parse(cleanedText)
    } catch (firstError) {
      try {
        // Strategy 2: Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)?.[0]
        if (!jsonMatch) throw new Error("No JSON object found")
        coverLetterData = JSON.parse(jsonMatch)
      } catch (secondError) {
        try {
          // Strategy 3: Find JSON between markers
          const jsonStart = text.indexOf("{")
          const jsonEnd = text.lastIndexOf("}") + 1
          if (jsonStart === -1 || jsonEnd === 0) throw new Error("No JSON brackets found")
          const jsonString = text.substring(jsonStart, jsonEnd)
          coverLetterData = JSON.parse(jsonString)
        } catch (thirdError) {
          // Strategy 4: Create fallback response
          console.error("All JSON parsing strategies failed. Raw response:", text)
          coverLetterData = {
            location: recipientInfo.location,
            date: currentDate,
            recipient: {
              name: recipientInfo.name,
              company: companyName,
              location: recipientInfo.location,
            },
            greeting: `Dear ${recipientInfo.name},`,
            body: {
              hook: `I'm excited to apply for the ${jobTitle} position at ${companyName}, where I can contribute my technical expertise to your innovative team.`,
              skills: `With experience in ${skillsHighlights.split(", ").slice(0, 3).join(", ")}, I've successfully ${experienceHighlights.split(".")[0]}.`,
              closing: `I'm eager to discuss how my background aligns with your team's goals and would welcome the opportunity to contribute to ${companyName}'s continued success.`,
            },
          }
        }
      }
    }

    // Validate required fields
    if (!coverLetterData.body || !coverLetterData.recipient) {
      throw new Error("Invalid cover letter data structure")
    }

    // Assemble full cover letter text for validation
    const fullCoverLetterText = `
${coverLetterData.greeting}

${coverLetterData.body.hook}

${coverLetterData.body.skills}

${coverLetterData.body.closing}

Sincerely,
${candidateName}
`

    // Validate tone alignment
    const toneValidation = await validateToneAlignment(fullCoverLetterText, finalTone, toneAnalysis.companyTraits)

    // If tone doesn't match, log the issue
    if (!toneValidation.passed) {
      console.warn("Cover letter tone doesn't match target tone:", toneValidation.feedback)
    }

    // Score cover letter quality
    const qualityCheck = await scoreCoverLetterQuality(fullCoverLetterText, jobDescription)

    return {
      location: coverLetterData.location,
      date: coverLetterData.date,
      recipient: coverLetterData.recipient,
      greeting: coverLetterData.greeting,
      body: coverLetterData.body,
      success: true,
      toneUsed: finalTone,
      qualityScore: qualityCheck.score,
      companyMission: companyMission,
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)

    let errorMessage = "Failed to generate cover letter. Please try again."

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "OpenAI API key is not properly configured. Please check your environment variables."
      } else if (error.message.includes("rate limit")) {
        errorMessage = "API rate limit exceeded. Please wait a moment and try again."
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      } else {
        errorMessage = error.message
      }
    }

    return {
      location: "",
      date: "",
      recipient: { name: "", company: "", location: "" },
      greeting: "",
      body: { hook: "", skills: "", closing: "" },
      success: false,
      error: errorMessage,
    }
  }
}
