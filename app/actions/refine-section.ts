"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function refineResumeSection(
  sectionType: "summary" | "skills" | "experience" | "cover-letter",
  currentContent: string,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  useGpt4 = false,
): Promise<string> {
  const model = useGpt4 ? openai("gpt-4o") : openai("gpt-3.5-turbo")

  try {
    const { text } = await generateText({
      model,
      prompt: `You are an expert resume writer. Refine this ${sectionType} section to better match the job requirements.

CURRENT CONTENT:
${currentContent}

JOB DESCRIPTION:
${jobDescription}

TARGET ROLE: ${jobTitle} at ${companyName}

REQUIREMENTS:
- Optimize for ATS systems
- Include relevant keywords from the job description
- Ensure content is compelling and relevant
- Maintain professional tone
- Keep formatting clean and readable

Return only the improved content, no explanations.`,
      temperature: 0.3,
      maxTokens: 500,
    })

    return text.trim()
  } catch (error) {
    console.error("Error refining section:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to refine section")
  }
}

export async function refineBulletPoint(
  bulletContent: string,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  bulletContext: {
    roleTitle: string
    company: string
    isExperience: boolean
  },
  useGpt4 = false,
): Promise<string> {
  const model = useGpt4 ? openai("gpt-4o") : openai("gpt-3.5-turbo")

  try {
    const { text } = await generateText({
      model,
      prompt: `You are an expert resume writer. Refine this bullet point to better match the job requirements.

BULLET POINT TO REFINE:
${bulletContent}

JOB DESCRIPTION:
${jobDescription}

TARGET ROLE: ${jobTitle} at ${companyName}

CONTEXT:
- Role: ${bulletContext.roleTitle}
- Company: ${bulletContext.company}
- Is Experience Section: ${bulletContext.isExperience}

REQUIREMENTS:
- Use strong action verbs
- Include relevant keywords from the job description
- Add metrics/numbers if possible
- Keep it concise and impactful
- Ensure ATS compatibility

Return only the improved bullet point, no explanations.`,
      temperature: 0.3,
      maxTokens: 200,
    })

    return text.trim()
  } catch (error) {
    console.error("Error refining bullet:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to refine bullet")
  }
}
