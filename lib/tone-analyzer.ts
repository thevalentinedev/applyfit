export type ToneType = "professional" | "friendly" | "bold" | "enthusiastic" | "humble" | "innovative"

export interface ToneAnalysis {
  detectedTone: ToneType
  confidence: number
  keywords: string[]
  companyTraits: string[]
  missionFocus: string[]
}

export function analyzeTone(jobDescription: string): ToneAnalysis {
  const text = jobDescription.toLowerCase()

  // Define tone indicators with weights
  const toneIndicators = {
    professional: {
      keywords: ["professional", "enterprise", "corporate", "formal", "established", "industry-leading", "standards"],
      weight: 1,
    },
    friendly: {
      keywords: [
        "collaborative",
        "team-oriented",
        "supportive",
        "inclusive",
        "welcoming",
        "community",
        "friendly",
        "warm",
        "culture",
        "family",
      ],
      weight: 1,
    },
    bold: {
      keywords: [
        "disruptive",
        "revolutionary",
        "cutting-edge",
        "bold",
        "ambitious",
        "challenging",
        "pioneering",
        "breakthrough",
        "transform",
        "game-changing",
      ],
      weight: 1,
    },
    enthusiastic: {
      keywords: [
        "passionate",
        "exciting",
        "dynamic",
        "energetic",
        "fast-paced",
        "thriving",
        "vibrant",
        "motivated",
        "driven",
        "enthusiastic",
      ],
      weight: 1,
    },
    humble: {
      keywords: [
        "learning",
        "growth",
        "mentorship",
        "development",
        "humble",
        "continuous improvement",
        "feedback",
        "open-minded",
      ],
      weight: 1,
    },
    innovative: {
      keywords: [
        "innovative",
        "creative",
        "forward-thinking",
        "next-generation",
        "modern",
        "advanced",
        "state-of-the-art",
        "emerging",
        "future",
      ],
      weight: 1,
    },
  }

  // Calculate scores for each tone
  const scores: Record<ToneType, number> = {
    professional: 0,
    friendly: 0,
    bold: 0,
    enthusiastic: 0,
    humble: 0,
    innovative: 0,
  }

  const foundKeywords: string[] = []
  const companyTraits: string[] = []

  // Score each tone based on keyword matches
  Object.entries(toneIndicators).forEach(([tone, { keywords, weight }]) => {
    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        scores[tone as ToneType] += weight
        foundKeywords.push(keyword)
      }
    })
  })

  // Extract company traits and mission focus
  const missionKeywords = [
    "mission",
    "vision",
    "values",
    "purpose",
    "impact",
    "change the world",
    "make a difference",
    "transform",
    "improve lives",
  ]

  const missionFocus: string[] = []
  missionKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      missionFocus.push(keyword)
    }
  })

  // Detect company traits
  const traitPatterns = [
    { pattern: /fast[- ]paced|rapid|quick|agile/i, trait: "fast-paced" },
    { pattern: /mission[- ]driven|purpose[- ]driven/i, trait: "mission-driven" },
    { pattern: /data[- ]driven|analytics|metrics/i, trait: "data-driven" },
    { pattern: /customer[- ]focused|user[- ]centric/i, trait: "customer-focused" },
    { pattern: /innovative|cutting[- ]edge/i, trait: "innovative" },
    { pattern: /collaborative|team[- ]work/i, trait: "collaborative" },
    { pattern: /startup|entrepreneurial/i, trait: "startup culture" },
    { pattern: /remote[- ]first|distributed/i, trait: "remote-friendly" },
  ]

  traitPatterns.forEach(({ pattern, trait }) => {
    if (pattern.test(jobDescription)) {
      companyTraits.push(trait)
    }
  })

  // Determine the dominant tone
  const maxScore = Math.max(...Object.values(scores))
  const detectedTone = (Object.keys(scores).find((tone) => scores[tone as ToneType] === maxScore) ||
    "professional") as ToneType

  // Calculate confidence based on score distribution
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const confidence = totalScore > 0 ? Math.min((maxScore / totalScore) * 100, 100) : 50

  return {
    detectedTone,
    confidence: Math.round(confidence),
    keywords: foundKeywords,
    companyTraits,
    missionFocus,
  }
}

export function getToneDescription(tone: ToneType): string {
  const descriptions = {
    professional: "Formal, polished, and business-focused",
    friendly: "Warm, collaborative, and approachable",
    bold: "Confident, ambitious, and forward-thinking",
    enthusiastic: "Energetic, passionate, and dynamic",
    humble: "Growth-minded, learning-focused, and modest",
    innovative: "Creative, cutting-edge, and future-oriented",
  }
  return descriptions[tone]
}

export function getTonePromptGuidance(tone: ToneType, companyTraits: string[]): string {
  const baseGuidance = {
    professional:
      "Write in a polished, formal tone that demonstrates expertise and reliability. Use industry terminology appropriately.",
    friendly:
      "Write in a warm, collaborative tone that emphasizes teamwork and cultural fit. Show enthusiasm for working with others.",
    bold: "Write in a confident, ambitious tone that showcases leadership potential and willingness to take on challenges.",
    enthusiastic: "Write in an energetic, passionate tone that conveys excitement about the role and company mission.",
    humble: "Write in a growth-minded tone that emphasizes learning, development, and openness to feedback.",
    innovative:
      "Write in a creative, forward-thinking tone that highlights technical curiosity and passion for emerging technologies.",
  }

  let guidance = baseGuidance[tone]

  // Add company-specific guidance
  if (companyTraits.length > 0) {
    const traitGuidance = companyTraits
      .map((trait) => {
        switch (trait) {
          case "fast-paced":
            return "Emphasize ability to thrive in dynamic environments and deliver quickly."
          case "mission-driven":
            return "Connect personal values with the company's mission and social impact."
          case "data-driven":
            return "Highlight analytical thinking and evidence-based decision making."
          case "customer-focused":
            return "Emphasize user empathy and customer-centric development approach."
          case "innovative":
            return "Showcase technical creativity and passion for cutting-edge solutions."
          case "collaborative":
            return "Highlight cross-functional teamwork and communication skills."
          case "startup culture":
            return "Emphasize adaptability, ownership mentality, and entrepreneurial spirit."
          case "remote-friendly":
            return "Highlight self-direction and effective remote collaboration skills."
          default:
            return ""
        }
      })
      .filter(Boolean)
      .join(" ")

    if (traitGuidance) {
      guidance += ` ${traitGuidance}`
    }
  }

  return guidance
}
