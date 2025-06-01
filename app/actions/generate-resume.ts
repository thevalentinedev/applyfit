"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { generateResumePrompt, RESUME_TEMPLATE } from "@/lib/resume-template"
import { ActionVerbEnforcer } from "@/lib/action-verb-enforcer"
import { ExperienceAnalyzer } from "@/lib/experience-analyzer"
import BulletQualityEnhancer from "@/lib/bullet-quality-enhancer"
import { SkillsExtractor } from "@/lib/skills-extractor"

export type UserProfile = {
  name: string
  email: string
  phone: string
  location: string
  portfolio?: string
  linkedin?: string
  github?: string
  education: string
  currentRole?: string
  experience: string
  projects: string
}

export type GeneratedResume = {
  jobTitle: string
  location: string
  summary: string
  skills: {
    Languages: string[]
    Frameworks: string[]
    "Tools & Platforms": string[]
    Practices: string[]
  }
  experience: Array<{
    title: string
    period: string
    bullets: string[]
    fabricated?: boolean
  }>
  projects: Array<{
    title: string
    period: string
    bullets: string[]
  }>
  success: boolean
  error?: string
  fabricatedExperienceAdded?: boolean
  qualityScore?: {
    overall: number
    actionVerbVariety: number
    sentenceStructure: number
    buzzwordFree: number
    metricBalance: number
    skillsAlignment: number
  }
}

export async function generateResume(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  userProfile: UserProfile,
  useGpt4 = false,
): Promise<GeneratedResume> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.")
    }

    // Analyze if additional experience is needed
    const needsAdditionalExperience = ExperienceAnalyzer.requiresAdditionalExperience(jobDescription)

    // Extract and organize skills from job description
    const extractedSkills = SkillsExtractor.extractSkillsFromJobDescription(jobDescription, jobTitle)

    const prompt = generateResumePrompt(jobTitle, companyName, jobDescription)

    const { text } = await generateText({
      model: openai(useGpt4 ? "gpt-4o" : "gpt-3.5-turbo"),
      prompt,
      temperature: 0.4, // Slightly higher for more creative bullet writing
      maxTokens: 3000, // Increased for comprehensive skills extraction
    })

    // Parse the JSON response
    const cleanedText = text.trim()
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const resumeData = JSON.parse(jsonMatch[0])

    // Validate that we have the required fields
    if (!resumeData.jobTitle) {
      resumeData.jobTitle = jobTitle // Fallback to the original job title
    }

    if (!resumeData.location) {
      resumeData.location = "Remote" // Default to Remote if location is missing
    }

    // Enhance skills section with extracted skills if GPT missed any
    if (resumeData.skills) {
      resumeData.skills = SkillsExtractor.enhanceSkillsSection(resumeData.skills, extractedSkills)
    } else {
      // Fallback to extracted skills if GPT didn't generate skills section
      resumeData.skills = extractedSkills
    }

    // Validate that we have intelligent job titles (not "Dynamic Role")
    if (resumeData.experience) {
      resumeData.experience = resumeData.experience.map((exp: any) => {
        if (exp.title && exp.title.includes("Dynamic Role")) {
          // Fallback to generate a better title based on the job description
          const company = exp.title.split(" - ")[1] || exp.title
          const baseTitle = jobTitle.includes("Frontend")
            ? "Frontend Engineer"
            : jobTitle.includes("Software")
              ? "Software Engineer"
              : jobTitle.includes("Full Stack")
                ? "Full Stack Developer"
                : "Software Developer"
          exp.title = `${baseTitle} - ${company}`
        }
        return exp
      })
    }

    // Check if fabricated experience was added
    const fabricatedExperienceAdded = resumeData.experience?.some((exp: any) => exp.fabricated) || false

    // If GPT didn't add fabricated experience but it's needed, add it manually
    if (needsAdditionalExperience && !fabricatedExperienceAdded && resumeData.experience?.length <= 2) {
      const bestFabricatedExp = ExperienceAnalyzer.selectBestFabricatedExperience(jobTitle, jobDescription)
      const technologies = resumeData.skills?.Frameworks || ["React", "JavaScript"]
      const fabricatedBullets = ExperienceAnalyzer.generateFabricatedBullets(
        bestFabricatedExp.type,
        jobDescription,
        technologies,
      )

      const fabricatedExperience = {
        title: `${bestFabricatedExp.title} - ${bestFabricatedExp.company}`,
        period: bestFabricatedExp.period,
        bullets: fabricatedBullets,
        fabricated: true,
      }

      // Insert fabricated experience as the third entry (after real experiences)
      if (resumeData.experience) {
        resumeData.experience.push(fabricatedExperience)
      }
    }

    // Validate action verb uniqueness
    const verbEnforcer = new ActionVerbEnforcer()
    const allBullets: string[] = []

    // Collect all bullets from experience and projects
    if (resumeData.experience) {
      resumeData.experience.forEach((exp: any) => {
        if (exp.bullets) {
          allBullets.push(...exp.bullets)
        }
      })
    }

    if (resumeData.projects) {
      resumeData.projects.forEach((project: any) => {
        if (project.bullets) {
          allBullets.push(...project.bullets)
        }
      })
    }

    // Validate bullet quality
    const qualityValidation = BulletQualityEnhancer.validateBulletQuality(allBullets)
    if (!qualityValidation.isValid) {
      console.warn("Bullet quality issues detected:", qualityValidation.issues)
      console.log("Suggestions:", qualityValidation.suggestions)
    }

    // Validate action verb uniqueness
    const verbValidation = verbEnforcer.validateBullets(allBullets)
    if (!verbValidation.isValid) {
      console.warn("Repeated action verbs detected:", verbValidation.repeatedVerbs)
    }

    // Validate skills alignment
    const skillsAlignment = SkillsExtractor.validateSkillsAlignment(resumeData.skills, extractedSkills)

    // Calculate quality score
    const qualityScore = {
      overall: qualityValidation.isValid && verbValidation.isValid && skillsAlignment.isAligned ? 95 : 75,
      actionVerbVariety: verbValidation.isValid ? 100 : 60,
      sentenceStructure:
        qualityValidation.issues.filter((issue) => issue.includes("structure")).length === 0 ? 100 : 70,
      buzzwordFree: qualityValidation.issues.filter((issue) => issue.includes("buzzword")).length === 0 ? 100 : 60,
      metricBalance: qualityValidation.issues.filter((issue) => issue.includes("metrics")).length === 0 ? 100 : 70,
      skillsAlignment: skillsAlignment.isAligned ? 100 : skillsAlignment.alignmentScore,
    }

    // Improve bullets if needed
    if (resumeData.experience) {
      resumeData.experience = resumeData.experience.map((exp: any) => {
        if (exp.bullets) {
          exp.bullets = exp.bullets.map((bullet: string) =>
            BulletQualityEnhancer.improveBullet(bullet, {
              jobDescription,
              technologies: resumeData.skills?.Frameworks || [],
              role: exp.title,
            }),
          )
        }
        return exp
      })
    }

    return {
      jobTitle: resumeData.jobTitle,
      location: resumeData.location,
      summary: resumeData.summary,
      skills: resumeData.skills,
      experience: resumeData.experience,
      projects: resumeData.projects,
      success: true,
      fabricatedExperienceAdded: fabricatedExperienceAdded || needsAdditionalExperience,
      qualityScore,
    }
  } catch (error) {
    console.error("Error generating resume:", error)

    let errorMessage = "Failed to generate resume. Please try again."

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
      jobTitle: "",
      location: "",
      summary: "",
      skills: {
        Languages: [],
        Frameworks: [],
        "Tools & Platforms": [],
        Practices: [],
      },
      experience: [],
      projects: [],
      success: false,
      error: errorMessage,
    }
  }
}

// Export the template for reference
export { RESUME_TEMPLATE }
