export interface SkillsCategories {
  Languages: string[]
  Frameworks: string[]
  "Tools & Platforms": string[]
  Practices: string[]
}

export interface SkillsAlignment {
  isAligned: boolean
  alignmentScore: number
  missingSkills: string[]
  suggestions: string[]
}

export class SkillsExtractor {
  // Technology mappings for better categorization
  private static readonly LANGUAGE_KEYWORDS = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c#",
    "php",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "scala",
    "html",
    "css",
    "sql",
    "bash",
    "powershell",
    "r",
    "matlab",
    "c++",
    "c",
  ]

  private static readonly FRAMEWORK_KEYWORDS = [
    "react",
    "vue",
    "angular",
    "svelte",
    "next.js",
    "nuxt",
    "gatsby",
    "remix",
    "node.js",
    "express",
    "fastify",
    "koa",
    "nestjs",
    "django",
    "flask",
    "rails",
    "spring",
    "laravel",
    "symfony",
    "tailwind",
    "bootstrap",
    "material-ui",
    "chakra",
    "styled-components",
    "emotion",
    "sass",
    "less",
    "redux",
    "zustand",
    "mobx",
  ]

  private static readonly TOOLS_KEYWORDS = [
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "jenkins",
    "github",
    "gitlab",
    "bitbucket",
    "firebase",
    "supabase",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "elasticsearch",
    "figma",
    "sketch",
    "adobe",
    "photoshop",
    "illustrator",
    "xd",
    "invision",
    "zeplin",
    "webpack",
    "vite",
    "rollup",
    "babel",
    "eslint",
    "prettier",
    "jest",
    "cypress",
    "playwright",
    "postman",
    "insomnia",
    "jira",
    "confluence",
    "slack",
    "notion",
    "trello",
    "asana",
    "vercel",
    "netlify",
    "heroku",
    "digitalocean",
    "cloudflare",
    "stripe",
    "paypal",
  ]

  private static readonly PRACTICES_KEYWORDS = [
    "agile",
    "scrum",
    "kanban",
    "ci/cd",
    "devops",
    "tdd",
    "bdd",
    "pair programming",
    "code review",
    "responsive design",
    "accessibility",
    "seo",
    "performance optimization",
    "microservices",
    "api design",
    "rest",
    "graphql",
    "websockets",
    "oauth",
    "jwt",
    "unit testing",
    "integration testing",
    "e2e testing",
    "load testing",
    "security testing",
  ]

  /**
   * Extract skills from job description and categorize them
   */
  static extractSkillsFromJobDescription(jobDescription: string, jobTitle: string): SkillsCategories {
    const text = jobDescription.toLowerCase()
    const extractedSkills: SkillsCategories = {
      Languages: [],
      Frameworks: [],
      "Tools & Platforms": [],
      Practices: [],
    }

    // Extract languages
    this.LANGUAGE_KEYWORDS.forEach((keyword) => {
      if (text.includes(keyword)) {
        const formatted = this.formatSkillName(keyword)
        if (!extractedSkills.Languages.includes(formatted)) {
          extractedSkills.Languages.push(formatted)
        }
      }
    })

    // Extract frameworks
    this.FRAMEWORK_KEYWORDS.forEach((keyword) => {
      if (text.includes(keyword)) {
        const formatted = this.formatSkillName(keyword)
        if (!extractedSkills.Frameworks.includes(formatted)) {
          extractedSkills.Frameworks.push(formatted)
        }
      }
    })

    // Extract tools & platforms
    this.TOOLS_KEYWORDS.forEach((keyword) => {
      if (text.includes(keyword)) {
        const formatted = this.formatSkillName(keyword)
        if (!extractedSkills["Tools & Platforms"].includes(formatted)) {
          extractedSkills["Tools & Platforms"].push(formatted)
        }
      }
    })

    // Extract practices
    this.PRACTICES_KEYWORDS.forEach((keyword) => {
      if (text.includes(keyword)) {
        const formatted = this.formatSkillName(keyword)
        if (!extractedSkills.Practices.includes(formatted)) {
          extractedSkills.Practices.push(formatted)
        }
      }
    })

    // Add essential skills based on job title
    this.addEssentialSkills(extractedSkills, jobTitle)

    // Limit each category to prevent overwhelming
    extractedSkills.Languages = extractedSkills.Languages.slice(0, 6)
    extractedSkills.Frameworks = extractedSkills.Frameworks.slice(0, 8)
    extractedSkills["Tools & Platforms"] = extractedSkills["Tools & Platforms"].slice(0, 8)
    extractedSkills.Practices = extractedSkills.Practices.slice(0, 6)

    return extractedSkills
  }

  /**
   * Add essential skills based on job title
   */
  private static addEssentialSkills(skills: SkillsCategories, jobTitle: string): void {
    const title = jobTitle.toLowerCase()

    // Frontend essentials
    if (title.includes("frontend") || title.includes("front-end") || title.includes("react")) {
      if (!skills.Languages.includes("JavaScript")) skills.Languages.unshift("JavaScript")
      if (!skills.Languages.includes("HTML")) skills.Languages.push("HTML")
      if (!skills.Languages.includes("CSS")) skills.Languages.push("CSS")
      if (!skills.Frameworks.includes("React")) skills.Frameworks.unshift("React")
      if (!skills["Tools & Platforms"].includes("Git")) skills["Tools & Platforms"].push("Git")
      if (!skills.Practices.includes("Responsive Design")) skills.Practices.push("Responsive Design")
    }

    // Full-stack essentials
    if (title.includes("full stack") || title.includes("fullstack")) {
      if (!skills.Languages.includes("JavaScript")) skills.Languages.unshift("JavaScript")
      if (!skills.Frameworks.includes("React")) skills.Frameworks.unshift("React")
      if (!skills.Frameworks.includes("Node.js")) skills.Frameworks.push("Node.js")
      if (!skills["Tools & Platforms"].includes("Git")) skills["Tools & Platforms"].push("Git")
    }

    // Backend essentials
    if (title.includes("backend") || title.includes("back-end")) {
      if (!skills.Frameworks.includes("Node.js")) skills.Frameworks.unshift("Node.js")
      if (!skills.Languages.includes("JavaScript")) skills.Languages.unshift("JavaScript")
      if (!skills["Tools & Platforms"].includes("Git")) skills["Tools & Platforms"].push("Git")
      if (!skills.Practices.includes("API Design")) skills.Practices.push("API Design")
    }

    // Always include Git for software roles
    if (!skills["Tools & Platforms"].includes("Git")) {
      skills["Tools & Platforms"].push("Git")
    }
  }

  /**
   * Format skill names for consistency
   */
  private static formatSkillName(skill: string): string {
    const formatMap: { [key: string]: string } = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      html: "HTML",
      css: "CSS",
      sql: "SQL",
      react: "React",
      vue: "Vue.js",
      angular: "Angular",
      "next.js": "Next.js",
      "node.js": "Node.js",
      express: "Express",
      tailwind: "Tailwind CSS",
      bootstrap: "Bootstrap",
      "material-ui": "Material-UI",
      "styled-components": "Styled Components",
      aws: "AWS",
      azure: "Azure",
      gcp: "Google Cloud",
      docker: "Docker",
      kubernetes: "Kubernetes",
      github: "GitHub",
      gitlab: "GitLab",
      firebase: "Firebase",
      mongodb: "MongoDB",
      postgresql: "PostgreSQL",
      mysql: "MySQL",
      figma: "Figma",
      photoshop: "Photoshop",
      jest: "Jest",
      cypress: "Cypress",
      webpack: "Webpack",
      vite: "Vite",
      eslint: "ESLint",
      prettier: "Prettier",
      "ci/cd": "CI/CD",
      tdd: "TDD",
      "api design": "API Design",
      "responsive design": "Responsive Design",
      git: "Git",
    }

    return formatMap[skill.toLowerCase()] || skill.charAt(0).toUpperCase() + skill.slice(1)
  }

  /**
   * Enhance existing skills section with extracted skills
   */
  static enhanceSkillsSection(existingSkills: any, extractedSkills: SkillsCategories): SkillsCategories {
    const enhanced: SkillsCategories = {
      Languages: [...(existingSkills.Languages || [])],
      Frameworks: [...(existingSkills.Frameworks || [])],
      "Tools & Platforms": [...(existingSkills["Tools & Platforms"] || [])],
      Practices: [...(existingSkills.Practices || [])],
    }

    // Add missing skills from extraction
    extractedSkills.Languages.forEach((skill) => {
      if (!enhanced.Languages.includes(skill)) {
        enhanced.Languages.push(skill)
      }
    })

    extractedSkills.Frameworks.forEach((skill) => {
      if (!enhanced.Frameworks.includes(skill)) {
        enhanced.Frameworks.push(skill)
      }
    })

    extractedSkills["Tools & Platforms"].forEach((skill) => {
      if (!enhanced["Tools & Platforms"].includes(skill)) {
        enhanced["Tools & Platforms"].push(skill)
      }
    })

    extractedSkills.Practices.forEach((skill) => {
      if (!enhanced.Practices.includes(skill)) {
        enhanced.Practices.push(skill)
      }
    })

    // Limit each category
    enhanced.Languages = enhanced.Languages.slice(0, 6)
    enhanced.Frameworks = enhanced.Frameworks.slice(0, 8)
    enhanced["Tools & Platforms"] = enhanced["Tools & Platforms"].slice(0, 8)
    enhanced.Practices = enhanced.Practices.slice(0, 6)

    return enhanced
  }

  /**
   * Validate skills alignment with job requirements
   */
  static validateSkillsAlignment(resumeSkills: SkillsCategories, extractedSkills: SkillsCategories): SkillsAlignment {
    const allResumeSkills = [
      ...resumeSkills.Languages,
      ...resumeSkills.Frameworks,
      ...resumeSkills["Tools & Platforms"],
      ...resumeSkills.Practices,
    ].map((skill) => skill.toLowerCase())

    const allExtractedSkills = [
      ...extractedSkills.Languages,
      ...extractedSkills.Frameworks,
      ...extractedSkills["Tools & Platforms"],
      ...extractedSkills.Practices,
    ]

    const missingSkills: string[] = []
    let matchedSkills = 0

    allExtractedSkills.forEach((skill) => {
      if (allResumeSkills.includes(skill.toLowerCase())) {
        matchedSkills++
      } else {
        missingSkills.push(skill)
      }
    })

    const alignmentScore =
      allExtractedSkills.length > 0 ? Math.round((matchedSkills / allExtractedSkills.length) * 100) : 100

    const isAligned = alignmentScore >= 80

    const suggestions =
      missingSkills.length > 0
        ? [`Consider adding these JD-mentioned skills: ${missingSkills.slice(0, 3).join(", ")}`]
        : ["Skills section is well-aligned with job requirements"]

    return {
      isAligned,
      alignmentScore,
      missingSkills,
      suggestions,
    }
  }
}
