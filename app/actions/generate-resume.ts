"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { scoreResumeAgainstJD, formatResumeForScoring } from "@/lib/ats-scorer"

export interface UserProfile {
  id?: string
  user_id?: string
  email?: string
  full_name?: string
  phone?: string
  location?: string
  website?: string
  linkedin_url?: string
  github_url?: string
  bio?: string
  skills?: string[]
  experience_level?: string
  education?: Array<{
    id?: string
    institution?: string
    degree?: string
    field_of_study?: string
    start_date?: string
    end_date?: string
    graduation_year?: string
    gpa?: string
    description?: string
    achievements?: string
    location?: string
  }>
  professional_experience?: Array<{
    id?: string
    company?: string
    position?: string
    start_date?: string
    end_date?: string
    current?: boolean
    is_current?: boolean
    description?: string
    location?: string
  }>
  projects_achievements?: Array<{
    id?: string
    title?: string
    description?: string
    technologies?: string[]
    start_date?: string
    end_date?: string
    url?: string
    demo_url?: string
    github_url?: string
    is_ongoing?: boolean
  }>
  created_at?: string
  updated_at?: string
}

export interface GeneratedResume {
  success: boolean
  jobTitle: string
  location: string
  summary: string
  skills: { [category: string]: string[] }
  experience: Array<{
    title: string
    period: string
    bullets: string[]
  }>
  projects: Array<{
    title: string
    period: string
    bullets: string[]
  }>
  applicationId?: string
  error?: string
  atsScore?: number
  atsBreakdown?: any
  atsFeedback?: string[]
}

function extractKeywordsFromJD(jobDescription: string): string[] {
  // Simple keyword extraction - you can enhance this
  const keywords = []
  const techKeywords = [
    "React",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "REST API",
    "MongoDB",
    "PostgreSQL",
    "Git",
    "CI/CD",
    "Agile",
    "Scrum",
  ]

  for (const keyword of techKeywords) {
    if (jobDescription.toLowerCase().includes(keyword.toLowerCase())) {
      keywords.push(keyword)
    }
  }

  return keywords
}

export async function generateResume(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  useGpt4 = false,
  jobUrl?: string,
): Promise<GeneratedResume> {
  try {
    console.log("🔍 generateResume - Input Parameters:", {
      jobTitle,
      companyName,
      useGpt4,
      jobUrl,
    })

    // Get user profile from DAL
    const { getUserProfile } = await import("@/lib/dal")
    const userProfile = await getUserProfile()

    console.log("🔍 generateResume - Retrieved User Profile:", userProfile)

    if (!userProfile) {
      console.error("❌ generateResume - No user profile found")
      return {
        success: false,
        jobTitle,
        location: "Remote",
        summary: "",
        skills: {},
        experience: [],
        projects: [],
        error: "User profile is required to generate resume. Please complete your profile first.",
      }
    }

    // Validate required profile fields
    if (!userProfile.full_name) {
      console.error("❌ generateResume - Missing full name")
      return {
        success: false,
        jobTitle,
        location: "Remote",
        summary: "",
        skills: {},
        experience: [],
        projects: [],
        error: "Please add your full name to your profile before generating a resume.",
      }
    }

    // Extract keywords from job description
    const extractedKeywords = extractKeywordsFromJD(jobDescription)
    console.log("🔍 Extracted Keywords:", extractedKeywords)

    // Extract user profile data with proper fallbacks
    const userName = userProfile.full_name || "Your Name"
    const userEmail = userProfile.email || "your.email@example.com"
    const userPhone = userProfile.phone || ""
    const userWebsite = userProfile.website || ""
    const userLinkedIn = userProfile.linkedin_url || ""
    const userGitHub = userProfile.github_url || ""
    const userLocation = userProfile.location || "Remote"

    // Process education data
    const educationData =
      userProfile.education?.map((edu) => ({
        institution: edu.institution || "Institution",
        degree: edu.degree || "Degree",
        field_of_study: edu.field_of_study || "",
        graduation_year: edu.graduation_year || edu.end_date || "Year",
        gpa: edu.gpa || "",
        achievements: edu.achievements || edu.description || "",
        location: edu.location || "",
      })) || []

    // Process experience data
    const experienceData =
      userProfile.professional_experience?.map((exp) => ({
        company: exp.company || "Company",
        position: exp.position || "Position",
        start_date: exp.start_date || "",
        end_date: exp.end_date || (exp.current || exp.is_current ? "Present" : ""),
        description: exp.description || "",
        location: exp.location || "",
      })) || []

    // Process projects data
    const projectsData =
      userProfile.projects_achievements?.map((proj) => ({
        title: proj.title || "Project",
        description: proj.description || "",
        technologies: proj.technologies || [],
        start_date: proj.start_date || "",
        end_date: proj.end_date || (proj.is_ongoing ? "Present" : ""),
        url: proj.url || proj.demo_url || "",
        github_url: proj.github_url || "",
      })) || []

    const model = useGpt4 ? openai("gpt-4o") : openai("gpt-3.5-turbo")

    const prompt = `You are an expert resume writer and ATS optimization specialist. Create a tailored resume that will score 90+ on ATS systems.

CRITICAL: This resume will be evaluated by an ATS system for:
- Keyword match to job description
- Skills categorization and alignment  
- Experience relevance and specificity
- Action verb diversity and impact

MUST-INCLUDE KEYWORDS: ${extractedKeywords.join(", ")}

USER PROFILE DATA:
Name: ${userName}
Email: ${userEmail}
Phone: ${userPhone}
Website: ${userWebsite}
LinkedIn: ${userLinkedIn}
GitHub: ${userGitHub}
Location: ${userLocation}

EDUCATION:
${educationData
  .map(
    (edu) =>
      `- ${edu.degree} in ${edu.field_of_study} from ${edu.institution} (${edu.graduation_year})${edu.gpa ? `, GPA: ${edu.gpa}` : ""}${edu.achievements ? `, ${edu.achievements}` : ""}`,
  )
  .join("\n")}

PROFESSIONAL EXPERIENCE:
${experienceData
  .map((exp) => `- ${exp.position} at ${exp.company} (${exp.start_date} - ${exp.end_date}): ${exp.description}`)
  .join("\n")}

PROJECTS:
${projectsData
  .map(
    (proj) =>
      `- ${proj.title}: ${proj.description}${proj.technologies.length ? ` (Technologies: ${proj.technologies.join(", ")})` : ""}`,
  )
  .join("\n")}

BIO: ${userProfile.bio || ""}

JOB DETAILS:
Position: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}

ATS OPTIMIZATION REQUIREMENTS:
1. Include ALL must-include keywords naturally in context
2. Use unique action verbs for each bullet point
3. Include quantified achievements where possible
4. Ensure skills match job requirements exactly
5. Optimize for keyword density without stuffing

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "success": true,
  "jobTitle": "${jobTitle}",
  "location": "${userLocation}",
  "summary": "Professional summary paragraph that includes key job-relevant keywords",
  "skills": {
    "Technical Skills": ["skill1", "skill2"],
    "Programming Languages": ["lang1", "lang2"],
    "Tools & Technologies": ["tool1", "tool2"]
  },
  "experience": [
    {
      "title": "Job Title - Company Name",
      "period": "Start Date - End Date",
      "bullets": ["Achievement 1 with metrics", "Achievement 2 with impact", "Achievement 3 with keywords"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "period": "Start Date - End Date",
      "bullets": ["Description 1 with technologies", "Description 2 with impact"]
    }
  ]
}`

    console.log("🔍 generateResume - Sending prompt to AI...")

    const result = await generateText({
      model,
      prompt,
      temperature: 0.3, // Lower for more consistent output
      maxTokens: 2000,
    })

    console.log("🔍 generateResume - AI Response received:", result.text.substring(0, 200) + "...")

    try {
      // Clean and parse the JSON response
      let cleanedText = result.text.trim()

      // Remove markdown code blocks if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      // Find JSON object in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response")
      }

      const resumeData = JSON.parse(jsonMatch[0])

      // Track this job application automatically and get the application ID
      let applicationId: string | undefined
      try {
        console.log("🔍 Checking for existing job application...")
        const { findOrCreateJobApplication } = await import("@/lib/dal")

        const jobApplication = await findOrCreateJobApplication({
          company_name: companyName,
          job_title: jobTitle,
          job_link: jobUrl || null,
          job_description: jobDescription,
          resume_generated_at: new Date().toISOString(),
        })

        applicationId = jobApplication.id
        console.log("✅ Job application found/created with ID:", applicationId)
      } catch (trackingError) {
        console.error("❌ Failed to create job application:", trackingError)
        // Don't fail the resume generation if tracking fails
      }

      // Ensure the resume includes the user's actual data AND the application ID
      const finalResume: GeneratedResume = {
        ...resumeData,
        success: true,
        jobTitle,
        location: userLocation, // Use actual user location
        applicationId, // CRITICAL: Include the application ID
      }

      // Score the resume against ATS requirements
      try {
        const resumeText = formatResumeForScoring(finalResume)
        const scoreResult = await scoreResumeAgainstJD(resumeText, jobDescription, useGpt4)

        finalResume.atsScore = scoreResult.score
        finalResume.atsBreakdown = scoreResult.breakdown
        finalResume.atsFeedback = scoreResult.feedback

        console.log(`🎯 ATS Score: ${scoreResult.score}/100`)
      } catch (scoringError) {
        console.error("❌ ATS Scoring failed:", scoringError)
        // Don't fail resume generation if scoring fails
      }

      console.log("🔍 generateResume - Final Resume Generated Successfully:", {
        jobTitle: finalResume.jobTitle,
        location: finalResume.location,
        applicationId: finalResume.applicationId,
        hasExperience: finalResume.experience?.length > 0,
        hasProjects: finalResume.projects?.length > 0,
      })

      return finalResume
    } catch (parseError) {
      console.error("❌ generateResume - JSON Parse Error:", parseError)
      console.error("❌ Raw AI Response:", result.text)
      return {
        success: false,
        jobTitle,
        location: userLocation,
        summary: "",
        skills: {},
        experience: [],
        projects: [],
        error: "Failed to parse AI response. Please try again.",
      }
    }
  } catch (error) {
    console.error("❌ generateResume - Error:", error)
    return {
      success: false,
      jobTitle,
      location: "Remote",
      summary: "",
      skills: {},
      experience: [],
      projects: [],
      error: error instanceof Error ? error.message : "Unknown error occurred during resume generation",
    }
  }
}
