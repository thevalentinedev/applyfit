import type { UserProfile } from "@/app/actions/generate-resume"

export interface ATSKeywords {
  technicalSkills: string[]
  tools: string[]
  frameworks: string[]
  softSkills: string[]
  requirements: string[]
  industryTerms: string[]
  actionVerbs: string[]
}

export interface ATSPromptContext {
  jobTitle: string
  companyName: string
  jobDescription: string
  userProfile: UserProfile
  extractedKeywords: ATSKeywords
  targetScore: number
}

// Enhanced keyword extraction with ATS focus
export function extractATSKeywords(jobDescription: string): ATSKeywords {
  const text = jobDescription.toLowerCase()

  // Technical skills with broader coverage
  const technicalSkills = [
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
    "html",
    "css",
    "sql",
    "nosql",
    "graphql",
    "rest",
    "api",
    "microservices",
    "serverless",
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
    "nestjs",
    "django",
    "flask",
    "rails",
    "spring",
    "laravel",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "elasticsearch",
    "dynamodb",
    "firebase",
    "machine learning",
    "ai",
    "data science",
    "analytics",
    "big data",
    "etl",
    "data pipeline",
  ].filter((skill) => text.includes(skill.toLowerCase()))

  // Tools and platforms
  const tools = [
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "docker",
    "kubernetes",
    "jenkins",
    "github actions",
    "gitlab ci",
    "terraform",
    "ansible",
    "chef",
    "puppet",
    "vagrant",
    "helm",
    "istio",
    "prometheus",
    "grafana",
    "jira",
    "confluence",
    "slack",
    "teams",
    "notion",
    "trello",
    "asana",
    "linear",
    "figma",
    "sketch",
    "adobe",
    "photoshop",
    "illustrator",
    "xd",
    "invision",
    "zeplin",
    "postman",
    "insomnia",
    "swagger",
    "openapi",
    "git",
    "github",
    "gitlab",
    "bitbucket",
    "webpack",
    "vite",
    "rollup",
    "babel",
    "eslint",
    "prettier",
    "jest",
    "cypress",
    "playwright",
    "stripe",
    "paypal",
    "twilio",
    "sendgrid",
    "auth0",
    "okta",
    "firebase auth",
  ].filter((tool) => text.includes(tool.toLowerCase()))

  // Frameworks and libraries
  const frameworks = [
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
    "recoil",
    "apollo",
    "relay",
    "prisma",
    "typeorm",
    "sequelize",
    "express",
    "koa",
    "hapi",
    "fastify",
    "socket.io",
    "websockets",
    "grpc",
    "rabbitmq",
    "kafka",
  ].filter((framework) => text.includes(framework.toLowerCase()))

  // Soft skills and methodologies
  const softSkills = [
    "leadership",
    "communication",
    "collaboration",
    "teamwork",
    "problem-solving",
    "analytical",
    "creative",
    "innovative",
    "adaptable",
    "detail-oriented",
    "self-motivated",
    "proactive",
    "mentoring",
    "coaching",
    "training",
    "presenting",
    "documentation",
    "technical writing",
  ].filter((skill) => text.includes(skill.toLowerCase()))

  // Development practices and methodologies
  const requirements = [
    "agile",
    "scrum",
    "kanban",
    "lean",
    "devops",
    "ci/cd",
    "tdd",
    "bdd",
    "pair programming",
    "code review",
    "version control",
    "testing",
    "unit testing",
    "integration testing",
    "e2e testing",
    "performance optimization",
    "security",
    "accessibility",
    "responsive design",
    "mobile-first",
    "seo",
    "analytics",
    "monitoring",
    "logging",
    "debugging",
    "troubleshooting",
  ].filter((req) => text.includes(req.toLowerCase()))

  // Industry-specific terms
  const industryTerms = extractIndustryTerms(text)

  // Action verbs commonly found in job descriptions
  const actionVerbs = [
    "develop",
    "build",
    "create",
    "design",
    "implement",
    "maintain",
    "optimize",
    "improve",
    "lead",
    "manage",
    "coordinate",
    "collaborate",
    "mentor",
    "train",
    "support",
    "troubleshoot",
    "analyze",
    "research",
    "evaluate",
    "assess",
    "review",
    "test",
    "deploy",
    "monitor",
  ].filter((verb) => text.includes(verb))

  return {
    technicalSkills,
    tools,
    frameworks,
    softSkills,
    requirements,
    industryTerms,
    actionVerbs,
  }
}

// Extract industry-specific terms
function extractIndustryTerms(text: string): string[] {
  const terms: string[] = []

  // Fintech terms
  if (text.includes("fintech") || text.includes("financial") || text.includes("banking")) {
    const fintechTerms = [
      "payment processing",
      "blockchain",
      "cryptocurrency",
      "trading",
      "risk management",
      "compliance",
      "kyc",
      "aml",
    ]
    terms.push(...fintechTerms.filter((term) => text.includes(term)))
  }

  // E-commerce terms
  if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("retail")) {
    const ecommerceTerms = [
      "shopping cart",
      "payment gateway",
      "inventory management",
      "order fulfillment",
      "customer experience",
    ]
    terms.push(...ecommerceTerms.filter((term) => text.includes(term)))
  }

  // Healthcare terms
  if (text.includes("healthcare") || text.includes("medical") || text.includes("health")) {
    const healthcareTerms = ["hipaa", "ehr", "emr", "telemedicine", "patient data", "clinical", "fda"]
    terms.push(...healthcareTerms.filter((term) => text.includes(term)))
  }

  // SaaS terms
  if (text.includes("saas") || text.includes("software as a service")) {
    const saasTerms = ["multi-tenant", "subscription", "billing", "onboarding", "churn", "mrr", "arr"]
    terms.push(...saasTerms.filter((term) => text.includes(term)))
  }

  return terms
}

// Generate ATS-optimized resume prompt
export function generateATSOptimizedPrompt(context: ATSPromptContext): string {
  const { jobTitle, companyName, jobDescription, userProfile, extractedKeywords, targetScore } = context

  // Format user profile data
  const userDataSection = formatUserProfileForATS(userProfile)

  // Create keyword injection lists
  const keywordLists = formatKeywordsForPrompt(extractedKeywords)

  return `You are an expert ATS optimization specialist and senior tech recruiter. Your task is to create a resume that will score ${targetScore}+ on ATS systems.

CRITICAL ATS OPTIMIZATION REQUIREMENTS:
🎯 This resume WILL be evaluated by an ATS system for:
- Keyword match to job description (25% of score)
- Skills categorization and alignment (25% of score)  
- Experience relevance and specificity (25% of score)
- Format compatibility and section completeness (25% of score)

TARGET: Create a resume that scores ${targetScore}+ out of 100 on ATS evaluation.

${userDataSection}

JOB DETAILS:
Position: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}

${keywordLists}

ATS OPTIMIZATION STRATEGY:
1. KEYWORD INTEGRATION: Naturally incorporate ALL extracted keywords into relevant sections
2. SKILLS ALIGNMENT: Organize skills into ATS-friendly categories that match job requirements
3. EXPERIENCE RELEVANCE: Rewrite experience bullets to directly address job requirements
4. ACTION VERB DIVERSITY: Use unique, powerful action verbs for every bullet point
5. QUANTIFIED ACHIEVEMENTS: Include specific metrics and measurable results
6. SECTION COMPLETENESS: Ensure all critical resume sections are comprehensive

MANDATORY KEYWORD USAGE:
- Technical Skills: ${extractedKeywords.technicalSkills.slice(0, 8).join(", ")}
- Tools & Platforms: ${extractedKeywords.tools.slice(0, 8).join(", ")}
- Frameworks: ${extractedKeywords.frameworks.slice(0, 6).join(", ")}
- Methodologies: ${extractedKeywords.requirements.slice(0, 6).join(", ")}

ATS-SPECIFIC FORMATTING RULES:
- Use standard section headers (Summary, Skills, Experience, Projects, Education)
- Avoid tables, columns, graphics, or complex formatting
- Use consistent date formats (MM/YYYY - MM/YYYY)
- Include both acronyms and full terms (e.g., "API (Application Programming Interface)")
- Use industry-standard job titles and company descriptions

BULLET POINT REQUIREMENTS:
- Start each bullet with a unique action verb from: ${extractedKeywords.actionVerbs.slice(0, 10).join(", ")}
- Include specific technologies and tools mentioned in job description
- Quantify impact with realistic metrics based on user's actual experience
- Address job requirements directly and explicitly
- Vary sentence structure and length for natural flow

SKILLS SECTION OPTIMIZATION:
Organize skills into exactly these ATS-friendly categories:
- Programming Languages: [Focus on JD languages first]
- Frameworks & Libraries: [Prioritize JD frameworks]
- Tools & Platforms: [Include JD tools prominently]
- Development Practices: [Match JD methodologies]

EXPERIENCE SECTION OPTIMIZATION:
For each role:
- Use job-relevant title variations when appropriate
- Include company context that relates to target role
- Create 3-4 bullets per role that directly address job requirements
- Incorporate industry terms and technical keywords naturally
- Show progression and increasing responsibility

PROJECT SECTION OPTIMIZATION:
- Select projects that demonstrate JD-relevant skills
- Use technical keywords from job description
- Show measurable outcomes and business impact
- Include relevant technologies and methodologies

SUMMARY OPTIMIZATION:
Create a 3-line professional summary that:
- Opens with job title or relevant role designation
- Incorporates 5-8 key terms from job description
- Highlights most relevant experience and achievements
- Uses industry-standard terminology

RETURN FORMAT - JSON ONLY:
{
  "success": true,
  "jobTitle": "${jobTitle}",
  "location": "Location from JD or user profile",
  "summary": "ATS-optimized 3-line summary with JD keywords",
  "skills": {
    "Programming Languages": ["JD languages prioritized"],
    "Frameworks & Libraries": ["JD frameworks prioritized"], 
    "Tools & Platforms": ["JD tools prioritized"],
    "Development Practices": ["JD methodologies prioritized"]
  },
  "experience": [
    {
      "title": "Relevant Job Title - Company Name",
      "period": "MM/YYYY - MM/YYYY",
      "bullets": [
        "Action verb + JD keyword + quantified result",
        "Different action verb + technical detail + impact",
        "Unique action verb + collaboration + technology"
      ]
    }
  ],
  "projects": [
    {
      "title": "Project Name (JD-relevant)",
      "period": "MM/YYYY - MM/YYYY", 
      "bullets": [
        "Built/Developed + specific technologies from JD",
        "Implemented + methodology + measurable outcome"
      ]
    }
  ]
}

FINAL ATS VALIDATION:
Before returning, verify:
✅ All mandatory keywords are included naturally
✅ Skills categories match ATS expectations
✅ Every bullet uses a unique action verb
✅ Experience directly addresses job requirements
✅ Technical terms match job description exactly
✅ Format is ATS-compatible (no complex formatting)
✅ Section headers are standard and recognizable
✅ Content flows naturally despite keyword optimization

This resume must score ${targetScore}+ on ATS evaluation. Optimize aggressively for keyword matching while maintaining natural readability.`
}

// Format user profile for ATS optimization
function formatUserProfileForATS(profile: UserProfile): string {
  const sections = []

  // Basic Information
  sections.push(`CANDIDATE PROFILE:
Name: ${profile.full_name || "Candidate Name"}
Email: ${profile.email || "email@example.com"}
Phone: ${profile.phone || "Phone number"}
Location: ${profile.location || "Location"}
Website: ${profile.website || "Portfolio URL"}
LinkedIn: ${profile.linkedin_url || "LinkedIn URL"}
GitHub: ${profile.github_url || "GitHub URL"}`)

  // Education with ATS focus
  if (profile.education && profile.education.length > 0) {
    sections.push(`EDUCATION:`)
    profile.education.forEach((edu, index) => {
      sections.push(`${index + 1}. ${edu.degree || "Degree"} in ${edu.field_of_study || "Field"}
   Institution: ${edu.institution || "University"}
   Graduation: ${edu.graduation_year || edu.end_date || "Year"}
   ${edu.gpa ? `GPA: ${edu.gpa}` : ""}
   Achievements: ${edu.achievements || edu.description || "Standard coursework"}`)
    })
  }

  // Professional Experience with ATS context
  if (profile.professional_experience && profile.professional_experience.length > 0) {
    sections.push(`PROFESSIONAL EXPERIENCE:`)
    profile.professional_experience.forEach((exp, index) => {
      const endDate = exp.current || exp.is_current ? "Present" : exp.end_date || "End Date"
      sections.push(`${index + 1}. ${exp.position || "Position"} at ${exp.company || "Company"}
   Duration: ${exp.start_date || "Start"} to ${endDate}
   Location: ${exp.location || "Location"}
   Responsibilities: ${exp.description || "Job responsibilities and achievements"}`)
    })
  }

  // Projects with technical focus
  if (profile.projects_achievements && profile.projects_achievements.length > 0) {
    sections.push(`PROJECTS & TECHNICAL WORK:`)
    profile.projects_achievements.forEach((project, index) => {
      const status = project.is_ongoing ? "Ongoing" : `${project.start_date || "Start"} to ${project.end_date || "End"}`
      sections.push(`${index + 1}. ${project.title || "Project Title"}
   Timeline: ${status}
   Description: ${project.description || "Project details"}
   Technologies: ${Array.isArray(project.technologies) ? project.technologies.join(", ") : "Technologies used"}
   ${project.demo_url ? `Demo: ${project.demo_url}` : ""}
   ${project.github_url ? `Repository: ${project.github_url}` : ""}`)
    })
  }

  // Skills with ATS categorization hint
  if (profile.skills && profile.skills.length > 0) {
    sections.push(`CURRENT SKILLS: ${profile.skills.join(", ")}`)
  }

  // Bio for context
  if (profile.bio) {
    sections.push(`PROFESSIONAL BIO: ${profile.bio}`)
  }

  return sections.join("\n\n")
}

// Format keywords for prompt injection
function formatKeywordsForPrompt(keywords: ATSKeywords): string {
  return `
EXTRACTED JOB KEYWORDS (MUST INCLUDE):
🔧 Technical Skills: ${keywords.technicalSkills.join(", ")}
🛠️ Tools & Platforms: ${keywords.tools.join(", ")}
📚 Frameworks: ${keywords.frameworks.join(", ")}
🤝 Soft Skills: ${keywords.softSkills.join(", ")}
⚡ Methodologies: ${keywords.requirements.join(", ")}
🏢 Industry Terms: ${keywords.industryTerms.join(", ")}
💪 Action Verbs: ${keywords.actionVerbs.join(", ")}

KEYWORD INTEGRATION STRATEGY:
- Use technical skills in Skills section and experience bullets
- Incorporate tools naturally in project descriptions
- Include frameworks in relevant technical contexts
- Weave soft skills into summary and experience
- Reference methodologies in work descriptions
- Use industry terms to show domain knowledge
- Vary action verbs across all bullet points`
}

// Enhanced prompt for section regeneration with ATS focus
export function generateATSRegenerationPrompt(
  sectionType: string,
  context: ATSPromptContext,
  currentContent: string,
  specificFeedback: string[],
): string {
  const { extractedKeywords } = context

  const basePrompt = `You are optimizing a resume section for ATS compatibility. 

SECTION: ${sectionType.toUpperCase()}
CURRENT CONTENT: ${currentContent}
ATS FEEDBACK: ${specificFeedback.join("; ")}

OPTIMIZATION REQUIREMENTS:
- Target ATS score: 90+
- Include relevant keywords: ${extractedKeywords.technicalSkills.slice(0, 5).join(", ")}
- Use unique action verbs: ${extractedKeywords.actionVerbs.slice(0, 8).join(", ")}
- Address specific feedback points
- Maintain natural readability

Generate improved ${sectionType} content that addresses the ATS feedback while incorporating job-relevant keywords.`

  return basePrompt
}
