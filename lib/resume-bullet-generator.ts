import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export type BulletGenerationContext = {
  jobTitle: string
  companyName: string
  jobDescription: string
  userProfile: {
    summary: string
    skills: { [category: string]: string[] }
    experience: string
    projects: string
  }
  useGpt4: boolean
}

export type SectionType = "summary" | "skills" | "experience" | "projects"

export async function regenerateResumeSection(
  sectionType: SectionType,
  context: BulletGenerationContext,
  sectionIndex?: number,
): Promise<any> {
  // Check if API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.")
  }

  const prompts = {
    summary: `You are an expert resume writer. Generate a compelling 3-line professional summary for Valentine Ohalebo applying for "${context.jobTitle}" at ${context.companyName}.

REQUIREMENTS:
- Position Valentine as a top-tier candidate with 2+ years experience
- Include 2-3 key technologies from the job description
- Add quantified impact (e.g., "10k+ operations", "scalable systems")
- Use keywords for ATS optimization
- Professional, confident tone

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

CANDIDATE BACKGROUND:
${context.userProfile.summary}

Return ONLY a JSON object:
{
  "summary": "3-line professional summary with metrics and keywords"
}`,

    skills: `You are an ATS optimization expert. Generate technical skills for Valentine Ohalebo applying for "${context.jobTitle}" at ${context.companyName}.

REQUIREMENTS:
- Organize into exactly 4 categories: Languages, Frameworks, Tools & Platforms, Practices
- Prioritize technologies mentioned in the job description
- Include Valentine's core skills: JavaScript, TypeScript, React, Next.js
- Add relevant tools and methodologies from the JD

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

Return ONLY a JSON object:
{
  "skills": {
    "Languages": ["Most relevant from JD", "JavaScript", "TypeScript"],
    "Frameworks": ["JD frameworks", "React", "Next.js"],
    "Tools & Platforms": ["JD tools", "GitHub", "AWS"],
    "Practices": ["JD practices", "Agile", "Testing"]
  }
}`,

    experience: `You are an expert resume writer specializing in tech industry experience bullets. Generate compelling experience bullets for Valentine Ohalebo's work experience.

CRITICAL REQUIREMENTS:
- Use VARIED sentence starters (Led, Architected, Implemented, Optimized, Delivered, Streamlined, Enhanced, Built)
- Include specific metrics and quantified impact
- Align with "${context.jobTitle}" requirements
- Use strong action verbs, avoid "was responsible for"
- Make each bullet unique and impactful

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

EXPERIENCE CONTEXT:
${context.userProfile.experience}

Generate 3 bullets for ${sectionIndex === 0 ? "GeoEvent (Frontend/Software Engineer role)" : "Naija Jollof (Frontend Developer role)"}.

BULLET STRUCTURE EXAMPLES:
✅ "Architected scalable React application serving 10k+ users with 99.9% uptime"
✅ "Led cross-functional team to deliver feature reducing load times by 40%"
✅ "Implemented automated testing pipeline improving deployment confidence by 85%"

❌ "Built web applications using React"
❌ "Was responsible for frontend development"
❌ "Developed features for the platform"

Return ONLY a JSON object:
{
  "bullets": [
    "Action verb + specific achievement + metric/impact + relevant technology",
    "Different action verb + quantified outcome + JD-relevant skill",
    "Unique action verb + measurable result + technology alignment"
  ]
}`,

    projects: `You are an expert resume writer. Generate compelling project bullets for Valentine Ohalebo's ImageMark project, tailored for "${context.jobTitle}" at ${context.companyName}.

REQUIREMENTS:
- Use varied action verbs (Architected, Engineered, Developed, Optimized)
- Highlight the 10k+ operations processed metric
- Emphasize technologies relevant to the job description
- Show technical depth and user impact

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

PROJECT CONTEXT:
ImageMark - Watermarking application with smart positioning algorithms

Return ONLY a JSON object:
{
  "bullets": [
    "Architected watermarking application processing 10k+ operations with [JD-relevant tech]",
    "Engineered smart positioning algorithms using Canvas API and [relevant technology]",
    "Optimized performance achieving [specific metric] for enhanced user experience"
  ]
}`,
  }

  try {
    const { text } = await generateText({
      model: openai(context.useGpt4 ? "gpt-4o" : "gpt-3.5-turbo"),
      prompt: prompts[sectionType],
      temperature: 0.4,
      maxTokens: 600,
    })

    // Parse JSON response with fallback
    let result
    try {
      const cleanedText = text.trim()
      result = JSON.parse(cleanedText)
    } catch (parseError) {
      const jsonMatch = text.match(/\{[\s\S]*\}/)?.[0]
      if (jsonMatch) {
        result = JSON.parse(jsonMatch)
      } else {
        throw new Error("No valid JSON found in response")
      }
    }

    return result
  } catch (error) {
    console.error(`Error regenerating ${sectionType}:`, error)
    throw error
  }
}

// Enhanced bullet generation patterns
export const BULLET_PATTERNS = {
  actionVerbs: [
    "Architected",
    "Engineered",
    "Implemented",
    "Optimized",
    "Led",
    "Delivered",
    "Streamlined",
    "Enhanced",
    "Launched",
    "Developed",
    "Built",
    "Created",
    "Designed",
    "Improved",
    "Reduced",
    "Increased",
    "Automated",
    "Integrated",
    "Collaborated",
    "Spearheaded",
  ],

  metrics: [
    "X% improvement",
    "X+ users/operations",
    "X% faster performance",
    "X% reduction in load time",
    "X% increase in efficiency",
    "X+ team members",
    "X% uptime",
    "X% test coverage",
  ],

  technologies: [
    "React ecosystem",
    "TypeScript implementation",
    "Next.js optimization",
    "API integration",
    "Database optimization",
    "CI/CD pipeline",
    "Testing framework",
    "Performance monitoring",
  ],
}
