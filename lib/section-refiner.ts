import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { analyzeTone, getTonePromptGuidance } from "./tone-analyzer"

export async function refineSection(
  sectionType: "summary" | "skills" | "experience" | "cover-letter",
  currentContent: string,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  userProfile?: any,
  useGpt4 = false,
): Promise<string> {
  // Check if API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.")
  }

  // Analyze tone for context
  const toneAnalysis = analyzeTone(jobDescription)
  const toneGuidance = getTonePromptGuidance(toneAnalysis.detectedTone, toneAnalysis.companyTraits)

  const prompts = {
    summary: `You are an expert resume writer. Refine this professional summary for Valentine Ohalebo applying for "${jobTitle}" at ${companyName}.

CURRENT SUMMARY:
${currentContent}

JOB DESCRIPTION EXCERPT:
${jobDescription.substring(0, 1500)}

REFINEMENT GOALS:
- Enhance keyword alignment with the job description
- Improve impact and specificity
- Maintain professional, confident tone
- Keep it concise (3 lines maximum)
- Add relevant technologies or metrics if missing
- Use stronger action-oriented language
- Position Valentine as the ideal candidate for this specific role

REFINEMENT RULES:
- Extract 3-5 key technologies/skills from the JD and weave them naturally into the summary
- Include 1-2 quantified achievements if they enhance credibility
- Use keywords that will pass ATS screening
- Avoid buzzwords like "dynamic", "innovative", "cutting-edge"
- Focus on specific value Valentine brings to this role

Return only the refined summary text, no additional formatting or explanation.`,

    skills: `You are an ATS optimization expert. Refine this skills section for Valentine Ohalebo applying for "${jobTitle}" at ${companyName}.

CURRENT SKILLS:
${currentContent}

JOB DESCRIPTION EXCERPT:
${jobDescription.substring(0, 1500)}

REFINEMENT GOALS:
- Prioritize technologies mentioned in the job description
- Ensure proper categorization (Languages, Frameworks, Tools & Platforms, Practices)
- Add missing relevant skills from the JD
- Remove less relevant skills if needed
- Maintain Valentine's core competencies
- Optimize for ATS keyword matching

SKILLS ORGANIZATION RULES:
- **Languages**: Programming languages only (JavaScript, TypeScript, Python, etc.)
- **Frameworks**: Libraries and frameworks (React, Next.js, Node.js, etc.)
- **Tools & Platforms**: Development tools, cloud, databases (AWS, GitHub, Docker, etc.)
- **Practices**: Methodologies and practices (Agile, CI/CD, TDD, etc.)

Extract ALL technologies from the job description and prioritize them in the appropriate categories.
Limit each category to 4-8 items for optimal readability.

Return the refined skills in the same format as provided, with bold category headers.`,

    experience: `You are an expert resume writer. Refine this experience section for Valentine Ohalebo applying for "${jobTitle}" at ${companyName}.

CURRENT EXPERIENCE SECTION:
${currentContent}

JOB DESCRIPTION EXCERPT:
${jobDescription.substring(0, 1500)}

REFINEMENT GOALS:
- Use stronger, more varied action verbs (avoid repetition)
- Align bullets with job requirements and technologies
- Add specific metrics and quantified impact where credible
- Improve sentence structure variety
- Eliminate buzzwords and generic phrases
- Focus on real outcomes and achievements

BULLET ENHANCEMENT RULES:
- Each bullet must start with a unique action verb
- Vary sentence structures across bullets
- Include specific technologies from the JD
- Add realistic metrics (15-50% improvements, user counts, etc.)
- Focus on collaboration, problem-solving, and impact
- Avoid: "Built", "Developed", "Responsible for", "Utilized"
- Use: "Architected", "Optimized", "Streamlined", "Enhanced", "Delivered"

SENTENCE STRUCTURE EXAMPLES:
- Challenge-Solution: "Solved X by implementing Y, reducing Z by 30%"
- Collaboration: "Partnered with design team to deliver responsive components"
- Technical: "Refactored legacy codebase from jQuery to React, modernizing 15+ components"
- Impact: "Enhanced user experience through accessibility improvements"

Return only the refined experience section with improved bullets, maintaining the same structure.`,

    "cover-letter": `You are an expert cover letter writer. Refine this cover letter paragraph for Valentine Ohalebo applying for "${jobTitle}" at ${companyName}.

CURRENT PARAGRAPH:
${currentContent}

JOB DESCRIPTION EXCERPT:
${jobDescription.substring(0, 1500)}

TONE GUIDANCE:
${toneGuidance}

COMPANY TRAITS: ${toneAnalysis.companyTraits.join(", ") || "Professional environment"}

REFINEMENT GOALS:
- Match the company's tone and culture (${toneAnalysis.detectedTone})
- Strengthen connection to job requirements
- Add specific achievements or technologies if relevant
- Improve clarity and impact
- Maintain authentic, enthusiastic voice
- Keep it concise and engaging
- Eliminate generic phrases and buzzwords

COVER LETTER ENHANCEMENT RULES:
- Use specific technologies and skills from the JD
- Include concrete examples of relevant experience
- Show genuine interest in the company/role
- Avoid: "I am writing to apply", "I believe I would be", "I am confident"
- Use: Specific achievements, company research, role alignment
- Match the detected tone: ${toneAnalysis.detectedTone}

Return only the refined paragraph text, no additional formatting.`,
  }

  try {
    const { text } = await generateText({
      model: openai(useGpt4 ? "gpt-4o" : "gpt-3.5-turbo"),
      prompt: prompts[sectionType],
      temperature: 0.4,
      maxTokens: 500,
    })

    return text.trim()
  } catch (error) {
    console.error(`Error refining ${sectionType}:`, error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("OpenAI API key is not properly configured. Please check your environment variables.")
      } else if (error.message.includes("rate limit")) {
        throw new Error("API rate limit exceeded. Please wait a moment and try again.")
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection and try again.")
      }
    }

    throw new Error(`Failed to refine ${sectionType}. Please try again.`)
  }
}

// Refine individual bullet points
export async function refineBullet(
  bulletContent: string,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  context: {
    roleTitle: string
    company: string
    isExperience: boolean
  },
  useGpt4 = false,
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured.")
  }

  const contextType = context.isExperience ? "professional experience" : "project"

  const prompt = `You are an expert resume writer. Refine this single bullet point for Valentine Ohalebo's ${contextType} at ${context.company}, applying for "${jobTitle}" at ${companyName}.

CURRENT BULLET:
${bulletContent}

ROLE CONTEXT: ${context.roleTitle}

JOB DESCRIPTION EXCERPT:
${jobDescription.substring(0, 1000)}

REFINEMENT GOALS:
- Use a strong, unique action verb (avoid "Built", "Developed", "Created")
- Include specific technologies from the job description
- Add realistic metrics if they enhance credibility (15-50% improvements)
- Focus on specific outcomes and impact
- Align with job requirements and keywords
- Vary sentence structure from typical patterns

ACTION VERB OPTIONS:
Technical: Architected, Engineered, Refactored, Deployed, Optimized, Streamlined
Performance: Enhanced, Accelerated, Improved, Reduced, Eliminated, Boosted
Leadership: Led, Spearheaded, Coordinated, Facilitated, Mentored
Innovation: Designed, Pioneered, Implemented, Transformed, Modernized

BULLET QUALITY EXAMPLES:
✅ "Optimized database queries reducing API response time by 40% using PostgreSQL indexing"
✅ "Partnered with design team to implement responsive components using Tailwind CSS"
✅ "Streamlined deployment pipeline with GitHub Actions, cutting release time from 2 hours to 20 minutes"

Return only the refined bullet point, no additional text or formatting.`

  try {
    const { text } = await generateText({
      model: openai(useGpt4 ? "gpt-4o" : "gpt-3.5-turbo"),
      prompt,
      temperature: 0.4,
      maxTokens: 150,
    })

    return text.trim()
  } catch (error) {
    console.error("Error refining bullet:", error)
    throw new Error("Failed to refine bullet point. Please try again.")
  }
}
