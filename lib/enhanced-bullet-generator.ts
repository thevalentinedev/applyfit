import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { ActionVerbEnforcer } from "./action-verb-enforcer"
import { extractATSKeywords } from "./ats-optimized-prompt"

export type BulletGenerationContext = {
  jobTitle: string
  companyName: string
  jobDescription: string
  userProfile: {
    full_name?: string
    summary: string
    skills: { [category: string]: string[] }
    experience: string
    projects: string
    professional_experience?: Array<{
      company: string
      position: string
      description: string
      start_date: string
      end_date?: string
      current?: boolean
    }>
  }
  useGpt4: boolean
}

export type SectionType = "summary" | "skills" | "experience" | "projects"

export interface BulletQualityMetrics {
  diversityIndex: number
  keywordDensity: number
  avgLength: number
  uniqueVerbs: number
  atsAlignment: number
}

export interface EnhancedBulletResult {
  bullets: string[]
  metrics: BulletQualityMetrics
  improvements: string[]
  atsKeywords: string[]
  usedVerbs: string[]
}

// Enhanced bullet generation with surgical precision
export async function regenerateResumeSection(
  sectionType: SectionType,
  context: BulletGenerationContext,
  sectionIndex?: number,
): Promise<any> {
  // Check if API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.")
  }

  // 🔧 FIX 1: Dynamic candidate name (no hardcoding)
  const candidateName = context.userProfile.full_name || "The candidate"

  // 🔧 FIX 3: Extract JD keywords for injection
  const extractedKeywords = extractATSKeywords(context.jobDescription)
  const priorityKeywords = [
    ...extractedKeywords.technicalSkills.slice(0, 5),
    ...extractedKeywords.tools.slice(0, 3),
    ...extractedKeywords.frameworks.slice(0, 3),
    ...extractedKeywords.requirements.slice(0, 2),
  ]

  // 🔧 FIX 2: Data-driven experience selection (no brittle index logic)
  let selectedExperience: any = null
  if (sectionType === "experience" && sectionIndex !== undefined) {
    selectedExperience = context.userProfile.professional_experience?.[sectionIndex]
    if (!selectedExperience) {
      // Fallback to hardcoded for backward compatibility, but log warning
      console.warn(`⚠️ Experience index ${sectionIndex} not found, using fallback`)
      selectedExperience = {
        company: sectionIndex === 0 ? "GeoEvent" : "Naija Jollof",
        position: sectionIndex === 0 ? "Frontend/Software Engineer" : "Frontend Developer",
      }
    }
  }

  const prompts = {
    summary: `You are an expert resume writer specializing in ATS optimization. Generate a compelling 3-line professional summary for ${candidateName} applying for "${context.jobTitle}" at ${context.companyName}.

CRITICAL REQUIREMENTS:
- Position ${candidateName} as a top-tier candidate with relevant experience
- Include 3-4 key technologies from the job description
- Add quantified impact (e.g., "10k+ operations", "scalable systems")
- Use keywords for ATS optimization
- Professional, confident tone

JOB-RELEVANT KEYWORDS TO INCLUDE: ${priorityKeywords.join(", ")}

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

CANDIDATE BACKGROUND:
${context.userProfile.summary}

Return ONLY a JSON object:
{
  "summary": "3-line professional summary with metrics and JD keywords"
}`,

    skills: `You are an ATS optimization expert. Generate technical skills for ${candidateName} applying for "${context.jobTitle}" at ${context.companyName}.

CRITICAL REQUIREMENTS:
- Organize into exactly 4 categories: Languages, Frameworks, Tools & Platforms, Practices
- Prioritize technologies mentioned in the job description
- Include ${candidateName}'s core skills from profile
- Add relevant tools and methodologies from the JD

MUST-INCLUDE KEYWORDS: ${priorityKeywords.join(", ")}

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

CANDIDATE SKILLS: ${JSON.stringify(context.userProfile.skills)}

Return ONLY a JSON object:
{
  "skills": {
    "Languages": ["Most relevant from JD", "Candidate's languages"],
    "Frameworks": ["JD frameworks", "Candidate's frameworks"],
    "Tools & Platforms": ["JD tools", "Candidate's tools"],
    "Practices": ["JD practices", "Candidate's practices"]
  }
}`,

    experience: `You are an expert resume writer specializing in tech industry experience bullets. Generate compelling experience bullets for ${candidateName}'s work experience.

CRITICAL REQUIREMENTS:
- Use VARIED sentence starters (Led, Architected, Implemented, Optimized, Delivered, Streamlined, Enhanced, Built)
- Include specific metrics and quantified impact
- Align with "${context.jobTitle}" requirements
- Use strong action verbs, avoid "was responsible for"
- Make each bullet unique and impactful
- MUST include relevant keywords from job description

COMPANY: ${selectedExperience?.company || "Previous Company"}
POSITION: ${selectedExperience?.position || "Previous Role"}
EXPERIENCE CONTEXT: ${selectedExperience?.description || context.userProfile.experience}

JOB-RELEVANT KEYWORDS TO WEAVE IN: ${priorityKeywords.join(", ")}

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

BULLET STRUCTURE EXAMPLES:
✅ "Architected scalable React application serving 10k+ users with 99.9% uptime using ${priorityKeywords[0] || "relevant tech"}"
✅ "Led cross-functional team to deliver feature reducing load times by 40% with ${priorityKeywords[1] || "modern tools"}"
✅ "Implemented automated testing pipeline improving deployment confidence by 85% using ${priorityKeywords[2] || "CI/CD tools"}"

❌ "Built web applications using React"
❌ "Was responsible for frontend development"
❌ "Developed features for the platform"

Return ONLY a JSON object:
{
  "bullets": [
    "Action verb + specific achievement + metric/impact + JD keyword",
    "Different action verb + quantified outcome + JD-relevant skill",
    "Unique action verb + measurable result + technology alignment"
  ]
}`,

    projects: `You are an expert resume writer. Generate compelling project bullets for ${candidateName}'s projects, tailored for "${context.jobTitle}" at ${context.companyName}.

REQUIREMENTS:
- Use varied action verbs (Architected, Engineered, Developed, Optimized)
- Highlight quantified metrics and user impact
- Emphasize technologies relevant to the job description
- Show technical depth and business value

MUST-INCLUDE KEYWORDS: ${priorityKeywords.join(", ")}

JOB DESCRIPTION EXCERPT:
${context.jobDescription.substring(0, 1000)}

PROJECT CONTEXT:
${context.userProfile.projects}

Return ONLY a JSON object:
{
  "bullets": [
    "Architected project processing X+ operations with ${priorityKeywords[0] || "relevant tech"}",
    "Engineered feature using ${priorityKeywords[1] || "modern framework"} achieving X% improvement",
    "Optimized performance with ${priorityKeywords[2] || "optimization tool"} for enhanced user experience"
  ]
}`,
  }

  try {
    const { text } = await generateText({
      model: openai(context.useGpt4 ? "gpt-4o" : "gpt-3.5-turbo"),
      prompt: prompts[sectionType],
      temperature: 0.3, // Lower for more consistent keyword inclusion
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

    // 🔧 FIX 4: Post-generation cleanup and validation
    if (sectionType === "experience" && result.bullets) {
      const enhancedResult = await cleanAndValidateBullets(
        result.bullets,
        priorityKeywords,
        extractedKeywords.actionVerbs,
      )
      return {
        ...result,
        ...enhancedResult,
        rawBullets: result.bullets, // Keep original for comparison
      }
    }

    return result
  } catch (error) {
    console.error(`Error regenerating ${sectionType}:`, error)
    throw error
  }
}

// 🔧 FIX 4: Post-generation bullet cleanup and validation
async function cleanAndValidateBullets(
  bullets: string[],
  jdKeywords: string[],
  availableVerbs: string[],
): Promise<EnhancedBulletResult> {
  const verbEnforcer = new ActionVerbEnforcer()
  const usedVerbs = new Set<string>()
  const cleanedBullets: string[] = []
  const improvements: string[] = []
  const includedKeywords: string[] = []

  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i].trim()

    // Clean up bullet formatting - remove leading dashes, bullets, or numbers
    bullet = bullet
      .replace(/^[-•*]\s*/, "") // Remove leading dash, bullet, or asterisk
      .replace(/^\d+\.\s*/, "") // Remove leading numbers like "1. "
      .trim()

    // Ensure bullet starts with capital letter
    if (bullet.length > 0) {
      bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1)
    }

    const originalBullet = bullet

    // Extract and check verb uniqueness
    const verb = bullet.split(" ")[0]
    if (usedVerbs.has(verb)) {
      // Find a replacement verb
      const newVerb = availableVerbs.find((v) => !usedVerbs.has(v)) || verb
      if (newVerb !== verb) {
        bullet = bullet.replace(/^[^\s]+/, newVerb)
        improvements.push(`Replaced repeated verb "${verb}" with "${newVerb}"`)
      }
    }
    usedVerbs.add(verb)

    // Check keyword inclusion
    const hasKeyword = jdKeywords.some((keyword) => bullet.toLowerCase().includes(keyword.toLowerCase()))
    if (!hasKeyword && jdKeywords.length > 0) {
      // Try to naturally incorporate a keyword
      const keywordToAdd = jdKeywords[i % jdKeywords.length]
      if (bullet.includes("using") || bullet.includes("with")) {
        // Keyword already has a natural insertion point
        bullet = bullet.replace(/(using|with)\s+/, `$1 ${keywordToAdd} and `)
      } else {
        // Add keyword naturally at the end
        bullet += ` leveraging ${keywordToAdd}`
      }
      improvements.push(`Added JD keyword "${keywordToAdd}" to bullet ${i + 1}`)
      includedKeywords.push(keywordToAdd)
    } else if (hasKeyword) {
      // Track which keywords were already included
      const foundKeywords = jdKeywords.filter((keyword) => bullet.toLowerCase().includes(keyword.toLowerCase()))
      includedKeywords.push(...foundKeywords)
    }

    // Ensure bullet length is reasonable (not too long/short)
    if (bullet.length > 150) {
      bullet = bullet.substring(0, 147) + "..."
      improvements.push(`Trimmed bullet ${i + 1} to optimal length`)
    } else if (bullet.length < 50) {
      improvements.push(`Bullet ${i + 1} might be too short - consider adding more detail`)
    }

    cleanedBullets.push(bullet)
  }

  // Calculate quality metrics
  const metrics = calculateBulletQualityMetrics(cleanedBullets, jdKeywords, Array.from(usedVerbs))

  return {
    bullets: cleanedBullets,
    metrics,
    improvements,
    atsKeywords: [...new Set(includedKeywords)],
    usedVerbs: Array.from(usedVerbs),
  }
}

// ✨ ADVANCED: Bullet Diversity Index (BDI)
function calculateBulletQualityMetrics(
  bullets: string[],
  jdKeywords: string[],
  usedVerbs: string[],
): BulletQualityMetrics {
  // Diversity Index: unique verbs / total bullets
  const diversityIndex = Math.round((usedVerbs.length / bullets.length) * 100)

  // Keyword Density: JD keywords found / total JD keywords
  const keywordsFound = jdKeywords.filter((keyword) =>
    bullets.some((bullet) => bullet.toLowerCase().includes(keyword.toLowerCase())),
  ).length
  const keywordDensity = jdKeywords.length > 0 ? Math.round((keywordsFound / jdKeywords.length) * 100) : 100

  // Average Length
  const avgLength = Math.round(bullets.reduce((sum, bullet) => sum + bullet.length, 0) / bullets.length)

  // ATS Alignment Score (combination of diversity and keyword density)
  const atsAlignment = Math.round((diversityIndex + keywordDensity) / 2)

  return {
    diversityIndex,
    keywordDensity,
    avgLength,
    uniqueVerbs: usedVerbs.length,
    atsAlignment,
  }
}

// Enhanced bullet generation patterns with ATS focus
export const ENHANCED_BULLET_PATTERNS = {
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
    "Pioneered",
    "Transformed",
    "Accelerated",
    "Modernized",
    "Scaled",
  ],

  metricTemplates: [
    "X% improvement in performance",
    "X+ users/operations processed",
    "X% faster load times",
    "X% reduction in costs",
    "X% increase in efficiency",
    "X+ team members managed",
    "X% uptime achieved",
    "X% test coverage implemented",
    "X+ features delivered",
    "X% user satisfaction increase",
  ],

  keywordIntegration: [
    "using {keyword}",
    "leveraging {keyword}",
    "implementing {keyword}",
    "with {keyword} integration",
    "through {keyword} optimization",
    "via {keyword} architecture",
    "utilizing {keyword} best practices",
  ],
}

// Utility function to validate bullet quality before returning
export function validateBulletQuality(bullets: string[], minScore = 80): boolean {
  const verbEnforcer = new ActionVerbEnforcer()
  const validation = verbEnforcer.validateBullets(bullets)

  // Check for minimum quality standards
  const hasUniqueVerbs = validation.isValid
  const hasMetrics = bullets.some((bullet) => /\d+[%+]|\d+k\+|\d+\.\d+/.test(bullet))
  const reasonableLength = bullets.every((bullet) => bullet.length >= 50 && bullet.length <= 150)

  return hasUniqueVerbs && hasMetrics && reasonableLength
}
