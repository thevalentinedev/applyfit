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
  },
  useGpt4 = false,
  selectedTone: ToneType | "auto" = "auto",
): Promise<GeneratedCoverLetter> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.")
    }

    // Analyze tone from job description
    const toneAnalysis = analyzeTone(jobDescription)
    const finalTone = selectedTone === "auto" ? toneAnalysis.detectedTone : selectedTone

    // Get tone-specific guidance
    const toneGuidance = getTonePromptGuidance(finalTone, toneAnalysis.companyTraits)

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

    const experienceHighlights = resumeData.experience
      .slice(0, 2)
      .map((exp) => exp.bullets[0])
      .join(" ")

    // Extract company mission/values if mentioned
    const missionMatch = jobDescription.match(
      /(mission|vision|values|purpose|impact|transform|improve|change)[^.]*[.]/gi,
    )
    const missionContext = missionMatch ? missionMatch.slice(0, 2).join(" ") : ""

    const prompt = `You are an expert cover letter writer specializing in tech industry applications. Write a compelling, personalized cover letter for Valentine Ohalebo applying for "${jobTitle}" at ${companyName}.

TONE & STYLE: ${toneGuidance}

COMPANY TRAITS: ${toneAnalysis.companyTraits.join(", ") || "Professional environment"}

CANDIDATE HIGHLIGHTS:
- Summary: ${resumeData.summary}
- Key Skills: ${skillsHighlights}
- Experience: ${experienceHighlights}

JOB REQUIREMENTS (Key excerpts):
${jobDescription.substring(0, 1500)}

INSTRUCTIONS:
1. Write in ${finalTone} tone that matches the company culture
2. Keep it concise (150-200 words total)
3. Connect Valentine's experience to specific job requirements
4. Show genuine enthusiasm for the company mission
5. End with a strong call-to-action

CRITICAL: Return ONLY valid JSON in this exact format with no additional text:

{
  "location": "Remote",
  "date": "${currentDate}",
  "recipient": {
    "name": "Hiring Team",
    "company": "${companyName}",
    "location": "Remote"
  },
  "greeting": "Dear Hiring Team,",
  "body": {
    "hook": "Opening sentence connecting to company mission",
    "skills": "2-3 sentences highlighting relevant skills and achievements",
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
            location: "Remote",
            date: currentDate,
            recipient: {
              name: "Hiring Team",
              company: companyName,
              location: "Remote",
            },
            greeting: "Dear Hiring Team,",
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

    return {
      location: coverLetterData.location,
      date: coverLetterData.date,
      recipient: coverLetterData.recipient,
      greeting: coverLetterData.greeting,
      body: coverLetterData.body,
      success: true,
      toneUsed: finalTone,
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
