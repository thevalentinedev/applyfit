export class ExperienceAnalyzer {
  private static readonly SENIOR_KEYWORDS = [
    "2+ years",
    "3+ years",
    "4+ years",
    "5+ years",
    "mid-level",
    "senior",
    "experienced",
    "seasoned",
    "minimum 2 years",
    "at least 2 years",
    "2-3 years",
    "intermediate",
    "advanced",
    "lead",
    "principal",
  ]

  private static readonly FABRICATED_EXPERIENCES = [
    {
      type: "internship",
      title: "Software Development Intern",
      company: "TechStart Solutions",
      location: "Remote",
      period: "May 2023 - Aug 2023",
      suitableFor: ["frontend", "software", "web", "javascript", "react"],
    },
    {
      type: "hackathon",
      title: "Team Lead & Full Stack Developer",
      company: "Hack the North 2024",
      location: "Waterloo, ON",
      period: "Sep 2024",
      suitableFor: ["full stack", "leadership", "team", "innovation"],
    },
    {
      type: "capstone",
      title: "Lead Developer",
      company: "Conestoga College Capstone Project",
      location: "Waterloo, ON",
      period: "Sep 2024 - Dec 2024",
      suitableFor: ["academic", "project", "development", "collaboration"],
    },
    {
      type: "freelance",
      title: "Frontend Developer",
      company: "Freelance Development",
      location: "Remote",
      period: "Jun 2023 - Dec 2023",
      suitableFor: ["frontend", "client", "business", "independent"],
    },
    {
      type: "indie",
      title: "Creator & Developer",
      company: "Personal Project - Budget Tracker",
      location: "Remote",
      period: "Mar 2023 - Aug 2023",
      suitableFor: ["personal", "innovation", "product", "startup"],
    },
  ]

  static requiresAdditionalExperience(jobDescription: string): boolean {
    const lowerJD = jobDescription.toLowerCase()
    return this.SENIOR_KEYWORDS.some((keyword) => lowerJD.includes(keyword.toLowerCase()))
  }

  static selectBestFabricatedExperience(jobTitle: string, jobDescription: string) {
    const lowerJD = jobDescription.toLowerCase()
    const lowerTitle = jobTitle.toLowerCase()

    // Score each fabricated experience based on relevance
    const scored = this.FABRICATED_EXPERIENCES.map((exp) => {
      let score = 0

      // Check if experience type matches job requirements
      exp.suitableFor.forEach((keyword) => {
        if (lowerJD.includes(keyword) || lowerTitle.includes(keyword)) {
          score += 1
        }
      })

      // Prefer internship for entry-level, hackathon for innovation roles
      if (lowerJD.includes("intern") && exp.type === "internship") score += 2
      if (lowerJD.includes("innovation") && exp.type === "hackathon") score += 2
      if (lowerJD.includes("freelance") && exp.type === "freelance") score += 2

      return { ...exp, score }
    })

    // Return the highest scoring experience, or internship as default
    const best = scored.reduce((prev, current) => (current.score > prev.score ? current : prev))

    return best.score > 0 ? best : this.FABRICATED_EXPERIENCES[0] // Default to internship
  }

  static generateFabricatedBullets(experienceType: string, jobDescription: string, technologies: string[]): string[] {
    const templates = {
      internship: [
        "Collaborated with senior developers to implement responsive web components using {tech}, improving code quality by 15%",
        "Contributed to agile development process by participating in daily standups and sprint planning with 4-person team",
        "Enhanced debugging skills by resolving 20+ frontend issues and documenting solutions for team knowledge base",
      ],
      hackathon: [
        "Led 3-person development team to build innovative web application in 48-hour timeframe using {tech}",
        "Implemented real-time features and API integrations, achieving 2nd place finish among 50+ competing teams",
        "Coordinated project planning and task delegation while maintaining high code quality under tight deadlines",
      ],
      capstone: [
        "Architected full-stack web application for local business client using {tech} and modern development practices",
        "Collaborated with 3 team members following agile methodology to deliver project 2 weeks ahead of schedule",
        "Presented technical solution to faculty panel and client stakeholders, receiving highest project grade in cohort",
      ],
      freelance: [
        "Delivered custom websites for 3 small business clients using {tech}, improving their online presence by 40%",
        "Managed complete project lifecycle from requirements gathering to deployment and client training",
        "Optimized website performance achieving 90+ Lighthouse scores and implementing SEO best practices",
      ],
      indie: [
        "Designed and developed personal productivity application using {tech} with user authentication and data persistence",
        "Implemented responsive design principles ensuring seamless experience across desktop and mobile devices",
        "Deployed application to cloud platform and established CI/CD pipeline for automated testing and deployment",
      ],
    }

    const bullets = templates[experienceType as keyof typeof templates] || templates.internship
    const primaryTech = technologies[0] || "React"

    return bullets.map((bullet) => bullet.replace("{tech}", primaryTech))
  }
}
