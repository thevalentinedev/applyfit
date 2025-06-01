export class BulletQualityEnhancer {
  // Strong action verbs categorized by impact type
  static readonly ACTION_VERBS = {
    technical: [
      "Architected",
      "Engineered",
      "Refactored",
      "Deployed",
      "Configured",
      "Migrated",
      "Integrated",
      "Automated",
      "Containerized",
      "Modernized",
    ],
    performance: [
      "Optimized",
      "Accelerated",
      "Streamlined",
      "Enhanced",
      "Improved",
      "Reduced",
      "Eliminated",
      "Minimized",
      "Boosted",
      "Scaled",
    ],
    leadership: [
      "Led",
      "Spearheaded",
      "Coordinated",
      "Mentored",
      "Guided",
      "Facilitated",
      "Orchestrated",
      "Championed",
      "Initiated",
      "Launched",
    ],
    innovation: [
      "Designed",
      "Pioneered",
      "Developed",
      "Created",
      "Invented",
      "Prototyped",
      "Conceptualized",
      "Transformed",
      "Reimagined",
      "Revolutionized",
    ],
    delivery: [
      "Delivered",
      "Shipped",
      "Released",
      "Completed",
      "Achieved",
      "Executed",
      "Implemented",
      "Established",
      "Built",
      "Produced",
    ],
  }

  // Sentence structure patterns to avoid repetition
  static readonly SENTENCE_PATTERNS = [
    "challenge_solution", // "Solved X by implementing Y, resulting in Z"
    "outcome_focused", // "Achieved X through Y implementation"
    "collaboration", // "Partnered with X team to deliver Y"
    "user_impact", // "Enhanced user experience by X, leading to Y"
    "technical_deep_dive", // "Implemented X using Y and Z technologies"
    "process_improvement", // "Streamlined X process, reducing Y by Z"
  ]

  // Buzzwords to avoid and their better alternatives
  static readonly BUZZWORD_REPLACEMENTS = {
    "cross-functional": "engineering and design teams",
    "cutting-edge": "modern",
    dynamic: "responsive",
    "responsible for": "managed",
    utilized: "used",
    leveraged: "used",
    synergistic: "collaborative",
    "best practices": "industry standards",
    "state-of-the-art": "advanced",
    robust: "reliable",
  }

  // Realistic metric ranges for different types of improvements
  static readonly REALISTIC_METRICS = {
    performance: { min: 15, max: 60, unit: "%" },
    load_time: { min: 20, max: 50, unit: "%" },
    user_engagement: { min: 10, max: 35, unit: "%" },
    code_coverage: { min: 70, max: 95, unit: "%" },
    build_time: { min: 25, max: 70, unit: "%" },
    error_rate: { min: 30, max: 80, unit: "%" },
  }

  static validateBulletQuality(bullets: string[]): {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check for repeated action verbs
    const actionVerbs = bullets.map((bullet) => bullet.split(" ")[0].toLowerCase())
    const duplicateVerbs = actionVerbs.filter((verb, index) => actionVerbs.indexOf(verb) !== index)

    if (duplicateVerbs.length > 0) {
      issues.push(`Repeated action verbs: ${duplicateVerbs.join(", ")}`)
      suggestions.push("Use unique action verbs for each bullet point")
    }

    // Check for buzzwords
    bullets.forEach((bullet, index) => {
      Object.keys(this.BUZZWORD_REPLACEMENTS).forEach((buzzword) => {
        if (bullet.toLowerCase().includes(buzzword.toLowerCase())) {
          issues.push(`Bullet ${index + 1} contains buzzword: "${buzzword}"`)
          suggestions.push(`Replace "${buzzword}" with "${this.BUZZWORD_REPLACEMENTS[buzzword]}"`)
        }
      })
    })

    // Check for excessive metrics
    const totalMetrics = bullets.reduce((count, bullet) => {
      const metricMatches = bullet.match(/\d+(\.\d+)?%|\d+\+|\d+x/g)
      return count + (metricMatches ? metricMatches.length : 0)
    }, 0)

    if (totalMetrics > 2) {
      issues.push("Too many metrics across bullets")
      suggestions.push("Limit to 1-2 metrics per role for credibility")
    }

    // Check for sentence structure variety
    const similarStarts = bullets.filter((bullet) => bullet.includes(" using ") && bullet.includes(" to ")).length

    if (similarStarts > 1) {
      issues.push("Similar sentence structures detected")
      suggestions.push("Vary sentence patterns: challenge-solution, outcome-focused, collaboration")
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
    }
  }

  static generateMetric(type: keyof typeof BulletQualityEnhancer.REALISTIC_METRICS): string {
    const range = this.REALISTIC_METRICS[type]
    const value = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    return `${value}${range.unit}`
  }

  static improveBullet(
    bullet: string,
    context: {
      jobDescription: string
      technologies: string[]
      role: string
    },
  ): string {
    let improved = bullet

    // Replace buzzwords
    Object.entries(this.BUZZWORD_REPLACEMENTS).forEach(([buzzword, replacement]) => {
      const regex = new RegExp(buzzword, "gi")
      improved = improved.replace(regex, replacement)
    })

    // Add specific context if too generic
    if (improved.includes("web application") && context.technologies.length > 0) {
      improved = improved.replace("web application", `${context.technologies[0]} application`)
    }

    return improved
  }
}

export default BulletQualityEnhancer
