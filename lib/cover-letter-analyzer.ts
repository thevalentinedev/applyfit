export interface RevisionSuggestion {
  id: string
  type: "metrics" | "closing" | "tech" | "personalization" | "tone"
  title: string
  description: string
  severity: "high" | "medium" | "low"
  section: "hook" | "skills" | "closing"
}

export function analyzeCoverLetterForRevisions(
  coverLetterText: string,
  jobDescription: string,
  companyName: string,
): RevisionSuggestion[] {
  const suggestions: RevisionSuggestion[] = []
  const lowerText = coverLetterText.toLowerCase()
  const lowerJD = jobDescription.toLowerCase()

  // Check for metrics/numbers
  const hasMetrics = /\d+%|\d+x|\$\d+|\d+\+|increased by|reduced by|improved by|grew by/i.test(coverLetterText)
  if (!hasMetrics) {
    suggestions.push({
      id: "no-metrics",
      type: "metrics",
      title: "No metrics detected",
      description:
        "Add specific numbers, percentages, or quantifiable achievements to make your impact more compelling",
      severity: "high",
      section: "skills",
    })
  }

  // Check for generic closing
  const genericClosings = [
    "look forward to hearing from you",
    "thank you for your consideration",
    "i would love to discuss",
    "please feel free to contact me",
    "i am excited about this opportunity",
  ]
  const hasGenericClosing = genericClosings.some((phrase) => lowerText.includes(phrase))
  if (hasGenericClosing) {
    suggestions.push({
      id: "generic-closing",
      type: "closing",
      title: "Generic closing statement",
      description: "Create a more specific, action-oriented closing that references the company or role",
      severity: "medium",
      section: "closing",
    })
  }

  // Extract key technologies from job description
  const techKeywords = extractTechKeywords(jobDescription)
  const mentionedTech = techKeywords.filter((tech) => lowerText.includes(tech.toLowerCase()))

  if (mentionedTech.length === 0 && techKeywords.length > 0) {
    suggestions.push({
      id: "no-tech-keywords",
      type: "tech",
      title: "No tech mentioned from JD",
      description: `Consider mentioning: ${techKeywords.slice(0, 3).join(", ")} to show alignment with requirements`,
      severity: "high",
      section: "skills",
    })
  }

  // Check for company personalization
  const hasCompanyMention = lowerText.includes(companyName.toLowerCase())
  if (!hasCompanyMention) {
    suggestions.push({
      id: "no-company-mention",
      type: "personalization",
      title: "Limited company personalization",
      description: `Reference ${companyName} specifically to show genuine interest`,
      severity: "medium",
      section: "hook",
    })
  }

  // Check for weak action verbs
  const weakVerbs = ["worked on", "helped with", "was responsible for", "participated in"]
  const hasWeakVerbs = weakVerbs.some((verb) => lowerText.includes(verb))
  if (hasWeakVerbs) {
    suggestions.push({
      id: "weak-verbs",
      type: "tone",
      title: "Weak action verbs detected",
      description: 'Use stronger action verbs like "led", "architected", "optimized", "delivered"',
      severity: "medium",
      section: "skills",
    })
  }

  return suggestions.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

function extractTechKeywords(jobDescription: string): string[] {
  const techPatterns = [
    // Programming languages
    /\b(javascript|typescript|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin)\b/gi,
    // Frameworks
    /\b(react|angular|vue|node\.?js|express|django|flask|spring|laravel|rails)\b/gi,
    // Databases
    /\b(mysql|postgresql|mongodb|redis|elasticsearch|cassandra|dynamodb)\b/gi,
    // Cloud/DevOps
    /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins|gitlab|github)\b/gi,
    // Tools
    /\b(git|jira|confluence|slack|figma|sketch|adobe|photoshop)\b/gi,
  ]

  const keywords = new Set<string>()

  techPatterns.forEach((pattern) => {
    const matches = jobDescription.match(pattern)
    if (matches) {
      matches.forEach((match) => keywords.add(match))
    }
  })

  return Array.from(keywords).slice(0, 10) // Limit to top 10
}
