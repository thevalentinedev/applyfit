export const ACTION_VERBS = {
  technical: [
    "Architected",
    "Engineered",
    "Implemented",
    "Optimized",
    "Streamlined",
    "Automated",
    "Integrated",
    "Deployed",
    "Configured",
    "Refactored",
    "Modernized",
    "Scaled",
    "Enhanced",
    "Migrated",
    "Containerized",
  ],
  leadership: [
    "Led",
    "Directed",
    "Coordinated",
    "Managed",
    "Supervised",
    "Mentored",
    "Guided",
    "Facilitated",
    "Orchestrated",
    "Spearheaded",
    "Championed",
    "Initiated",
    "Established",
    "Founded",
    "Launched",
  ],
  achievement: [
    "Delivered",
    "Achieved",
    "Exceeded",
    "Accelerated",
    "Improved",
    "Increased",
    "Reduced",
    "Eliminated",
    "Minimized",
    "Maximized",
    "Boosted",
    "Generated",
    "Produced",
    "Created",
    "Established",
  ],
  collaboration: [
    "Collaborated",
    "Partnered",
    "Coordinated",
    "Communicated",
    "Presented",
    "Consulted",
    "Advised",
    "Supported",
    "Assisted",
    "Contributed",
    "Participated",
    "Engaged",
    "Interfaced",
    "Liaised",
    "Negotiated",
  ],
  innovation: [
    "Pioneered",
    "Innovated",
    "Designed",
    "Conceptualized",
    "Developed",
    "Invented",
    "Researched",
    "Explored",
    "Experimented",
    "Prototyped",
    "Transformed",
    "Revolutionized",
    "Reimagined",
    "Modernized",
    "Advanced",
  ],
} as const

export type ActionVerbCategory = keyof typeof ACTION_VERBS

export class ActionVerbEnforcer {
  private usedVerbs: Set<string> = new Set()
  private verbsByCategory: Map<ActionVerbCategory, string[]> = new Map()

  constructor() {
    // Initialize available verbs by category
    Object.entries(ACTION_VERBS).forEach(([category, verbs]) => {
      this.verbsByCategory.set(category as ActionVerbCategory, [...verbs])
    })
  }

  /**
   * Get a unique action verb from the specified category
   */
  getUniqueVerb(category: ActionVerbCategory): string {
    const availableVerbs = this.verbsByCategory.get(category) || []
    const unusedVerbs = availableVerbs.filter((verb) => !this.usedVerbs.has(verb))

    if (unusedVerbs.length === 0) {
      // If all verbs in category are used, reset and use any verb
      this.resetCategory(category)
      return availableVerbs[Math.floor(Math.random() * availableVerbs.length)]
    }

    const selectedVerb = unusedVerbs[Math.floor(Math.random() * unusedVerbs.length)]
    this.usedVerbs.add(selectedVerb)
    return selectedVerb
  }

  /**
   * Check if a bullet point starts with a repeated verb
   */
  isVerbRepeated(bulletPoint: string): boolean {
    const firstWord = bulletPoint.trim().split(" ")[0]
    return this.usedVerbs.has(firstWord)
  }

  /**
   * Extract the action verb from a bullet point
   */
  extractVerb(bulletPoint: string): string {
    return bulletPoint.trim().split(" ")[0]
  }

  /**
   * Mark a verb as used
   */
  markVerbAsUsed(verb: string): void {
    this.usedVerbs.add(verb)
  }

  /**
   * Reset used verbs for a specific category
   */
  private resetCategory(category: ActionVerbCategory): void {
    const categoryVerbs = ACTION_VERBS[category]
    categoryVerbs.forEach((verb) => this.usedVerbs.delete(verb))
  }

  /**
   * Get all used verbs
   */
  getUsedVerbs(): string[] {
    return Array.from(this.usedVerbs)
  }

  /**
   * Reset all used verbs
   */
  reset(): void {
    this.usedVerbs.clear()
  }

  /**
   * Validate a set of bullet points for verb uniqueness
   */
  validateBullets(bullets: string[]): {
    isValid: boolean
    repeatedVerbs: string[]
    suggestions: string[]
  } {
    const verbs = bullets.map((bullet) => this.extractVerb(bullet))
    const verbCounts = new Map<string, number>()

    verbs.forEach((verb) => {
      verbCounts.set(verb, (verbCounts.get(verb) || 0) + 1)
    })

    const repeatedVerbs = Array.from(verbCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([verb, _]) => verb)

    const suggestions = repeatedVerbs.map((verb) => {
      // Find a suitable replacement from technical category
      return this.getUniqueVerb("technical")
    })

    return {
      isValid: repeatedVerbs.length === 0,
      repeatedVerbs,
      suggestions,
    }
  }
}

/**
 * Generate a diverse set of action verbs for resume bullets
 */
export function generateActionVerbSet(bulletCount: number): string[] {
  const enforcer = new ActionVerbEnforcer()
  const verbs: string[] = []
  const categories: ActionVerbCategory[] = ["technical", "achievement", "leadership", "innovation", "collaboration"]

  for (let i = 0; i < bulletCount; i++) {
    const category = categories[i % categories.length]
    verbs.push(enforcer.getUniqueVerb(category))
  }

  return verbs
}
