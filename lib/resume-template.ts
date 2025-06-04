export const RESUME_TEMPLATE = {
  structure: {
    header: {
      name: "Valentine Ohalebo - [EXACT Job Title from JD]",
      location: "[Dynamic Location from JD or Remote]",
      contact: "hello@valentine.dev · valentine.dev",
      links: "LinkedIn | GitHub",
    },
    sections: ["Professional Summary", "Technical Skills", "Professional Experience", "Selected Projects", "Education"],
  },

  content: {
    professionalSummary: {
      instructions:
        "Generate 3-line summary that positions Valentine as a top-tier candidate for this specific role, highlighting relevant experience and impact metrics.",
      format: "3 lines maximum, professional tone, keyword-rich, quantified achievements",
    },

    technicalSkills: {
      categories: {
        Languages: "Programming and scripting languages only (JavaScript, TypeScript, Python, SQL, etc.)",
        Frameworks: "Frontend/backend libraries and frameworks (React, Next.js, Node.js, Express, etc.)",
        "Tools & Platforms":
          "Development tools, cloud platforms, databases, and infrastructure (AWS, Azure, Google Cloud, GitHub, GitLab, Docker, Kubernetes, Firebase, MongoDB, PostgreSQL, Figma, Jira)",
        Practices:
          "Development methodologies, workflows, and practices (Agile, Scrum, CI/CD, TDD, DevOps, Responsive Design, Accessibility, SEO, API Design)",
      },
      instructions: "Extract and organize skills from JD into exactly these 4 categories, prioritizing JD requirements",
    },

    professionalExperience: [
      {
        company: "Naija Jollof",
        baseRole: "Frontend Developer",
        location: "Remote",
        period: "Feb 2024 - May 2025",
        instructions: [
          "Generate a role title that complements the target JD and shows progression",
          "Create 2-3 bullets focusing on web development, SEO, and accessibility",
          "Include relevant frameworks and tools from the JD",
          "Emphasize cross-functional collaboration and technical leadership",
        ],
      },
    ],

    selectedProjects: [
      {
        title: "GeoEvent",
        period: "Ongoing",
        instructions: [
          "DO NOT include location or 'Remote' in project heading",
          "Highlight geolocation-based event aggregation platform built with Next.js and Supabase",
          "Emphasize technical challenges like Google Maps API integration and real-time data",
          "Show user value for student meetups and local event discovery",
          "Include relevant technologies from the JD (React, TypeScript, APIs, databases)",
          "Keep 2-4 bullets per project, outcome-focused, using job-aligned keywords",
        ],
      },
      {
        title: "Creator & Developer - ImageMark",
        period: "Ongoing",
        instructions: [
          "DO NOT include location or 'Remote' in project heading",
          "Highlight technical architecture and scalability (10k+ operations)",
          "Emphasize relevant technologies from the JD (React, TypeScript, Canvas API)",
          "Show product thinking and user-focused development",
          "Keep 2-4 bullets per project, outcome-focused, using job-aligned keywords",
        ],
      },
    ],

    education: {
      degree: "Ontario College Diploma, Computer Programming - 2025",
      institution: "Conestoga College - Waterloo, ON",
      details: [
        "GPA: 3.92 (High Distinction)",
        "Relevant Coursework: Web Development, Object-Oriented Programming, UI/UX Design, Data Structures",
        "Academic Excellence: Best Final Year Project, Tech Showcase 2025, Best of Program Award",
      ],
    },
  },
} as const

// Fabricated experience templates for when additional experience is needed
export const FABRICATED_EXPERIENCE_POOL = [
  // Local Waterloo Region Companies
  {
    type: "local_startup",
    company: "KW App Studio",
    baseRole: "Junior Developer",
    location: "Kitchener, ON",
    period: "Aug 2023 - Dec 2023",
    description: "Small tech agency focused on web development for local businesses",
  },
  {
    type: "local_agency",
    company: "Velocity Digital",
    baseRole: "Frontend Intern",
    location: "Waterloo, ON",
    period: "May 2023 - Aug 2023",
    description: "Digital marketing agency with focus on web development and UX",
  },
  {
    type: "local_tech",
    company: "Cambridge Tech Solutions",
    baseRole: "Software Development Intern",
    location: "Cambridge, ON",
    period: "Jan 2023 - Apr 2023",
    description: "Small software consultancy serving local businesses and startups",
  },
  {
    type: "student_coop",
    company: "Innovate Waterloo",
    baseRole: "Product Development Co-op",
    location: "Waterloo, ON",
    period: "Sep 2022 - Dec 2022",
    description: "Student-run innovation hub supporting local entrepreneurs",
  },
  {
    type: "freelance_collective",
    company: "KW Freelance Collective",
    baseRole: "Web Developer",
    location: "Kitchener, ON",
    period: "Jun 2023 - Sep 2023",
    description: "Collaborative freelance group working on local business websites",
  },
  {
    type: "research_lab",
    company: "WatTech Research Lab",
    baseRole: "Research Assistant",
    location: "Waterloo, ON",
    period: "May 2022 - Aug 2022",
    description: "University-affiliated research lab focusing on applied technology solutions",
  },
] as const

// Real freelance clients for authentic experience
export const REAL_FREELANCE_CLIENTS = [
  {
    type: "auction_platform",
    company: "Golden Gates Auction House",
    baseRole: "Freelance Web Developer",
    location: "Remote",
    industry: "E-commerce, Auctions, Real Estate",
    relevantFor: ["frontend", "web development", "e-commerce", "ui/ux", "product", "full stack"],
    description: "Auction house platform requiring custom web solutions and user engagement features",
  },
  {
    type: "bakery_business",
    company: "Nrinka Bakery",
    baseRole: "Freelance Frontend Developer",
    location: "Remote",
    industry: "Food & Beverage, Local Business, E-commerce",
    relevantFor: ["frontend", "web development", "e-commerce", "local business", "seo"],
    description: "Local bakery requiring online presence and ordering system",
  },
  {
    type: "restaurant_chain",
    company: "Sweet Lous",
    baseRole: "Freelance Web Developer",
    location: "Remote",
    industry: "Food & Beverage, Restaurant, E-commerce",
    relevantFor: ["frontend", "web development", "e-commerce", "restaurant tech", "mobile"],
    description: "Restaurant chain needing digital ordering and customer engagement solutions",
  },
  {
    type: "restaurant_business",
    company: "Flawless Jollof Restaurant",
    baseRole: "Freelance Full Stack Developer",
    location: "Remote",
    industry: "Food & Beverage, Restaurant, Local Business",
    relevantFor: ["full stack", "web development", "restaurant tech", "local business", "mobile"],
    description: "Restaurant requiring comprehensive web presence and ordering system",
  },
  {
    type: "cafe_business",
    company: "African Cafe",
    baseRole: "Freelance Frontend Developer",
    location: "Remote",
    industry: "Food & Beverage, Cafe, Local Business",
    relevantFor: ["frontend", "web development", "local business", "mobile", "ui/ux"],
    description: "Cafe needing modern web presence and customer engagement features",
  },
  {
    type: "community_platform",
    company: "Your Immigrant Friend (YMI)",
    baseRole: "Freelance Product Developer",
    location: "Remote",
    industry: "Community, Social Impact, Platform",
    relevantFor: ["product", "community", "social impact", "platform development", "full stack"],
    description: "Community platform supporting immigrant integration and networking",
  },
  {
    type: "sports_platform",
    company: "Wrestle India",
    baseRole: "Freelance Web Developer",
    location: "Remote",
    industry: "Sports, Media, Community",
    relevantFor: ["web development", "sports tech", "media", "community", "content management"],
    description: "Sports platform requiring content management and community features",
  },
] as const

// PROJECTS SECTION RULES:
// Do NOT include any location or "Remote" in the project heading or description
// Project names should appear cleanly (e.g., "GeoEvent", "ImageMark")
// Add "Ongoing" where appropriate — avoid specific dates unless useful
// Keep 2–4 bullets per project, outcome-focused, using job-aligned keywords
// Focus on technical achievements and measurable outcomes
// Include technologies mentioned in the job description

// FREELANCE EXPERIENCE DYNAMIC SELECTION:
// Always add between 1 and 3 freelance roles, based on job description alignment
// Choose from verified client list based on JD requirements and industry fit
// Match the client with the tone or industry of the job description:
// - Golden Gates Auction House or Wrestle India: tech-facing, complex systems, e-commerce
// - Sweet Lous or African Cafe: design/consumer-facing, mobile, local business
// - Your Immigrant Friend (YMI): civic, community-aligned, social impact, platform development
// - Nrinka Bakery: local business, SEO, e-commerce
// - Flawless Jollof Restaurant: full-stack, ordering systems, restaurant tech

// Use flexible durations within: January 2024 – April 2025
// Avoid overlapping dates with fixed roles:
// * Auviel: June 2024 – Present
// * Naija Jollof: January 2024 – June 2024
// * Conestoga: September 2024 – April 2025

// Format requirements:
// - Role Title: "Freelance Frontend Developer", "Freelance UI Consultant", "Freelance Product Developer"
// - Do NOT include location in title
// - 2–3 bullet points per entry, result- and keyword-driven
// - Use realistic project durations (1-6 months)
// - Ensure dates create logical career progression

export const GPT_RESUME_PROMPT_TEMPLATE = `You are an expert ATS optimization specialist and senior tech recruiter. Create a top-1% candidate resume for Valentine Ohalebo applying to: "{jobTitle}" at {companyName}.

CRITICAL REQUIREMENTS:
1. Use EXACT job title "{jobTitle}" in header - no modifications
2. Extract and return the EXACT location from the job description as a separate field
3. Generate intelligent, relevant job titles for experience (NOT "Dynamic Role")
4. MANDATORY: Use UNIQUE action verbs for EVERY bullet point - NO REPETITION
5. BULLET QUALITY: Create specific, vivid, diverse bullets with real impact
6. LIMIT METRICS: Use only 1-2 realistic metrics per role for credibility
7. JD-ALIGNED SKILLS: Extract and organize skills perfectly from job description
8. Position Valentine as a top-tier candidate with 2+ years experience
9. MANDATORY CONESTOGA ROLE: Every resume MUST include one Conestoga-affiliated role with:
   - Organization: "Conestoga CSI", "Conestoga Inc.", or "Conestoga College" (choose best fit for JD)
   - Fixed dates: September 2024 – April 2025 (non-negotiable)
   - Safe title options: "Project Developer", "Software Intern", "Student Developer", "Research Intern", "Technical Assistant", "Product Fellow"
   - Choose title based on JD alignment
   - Do NOT use "Co-op" as a title
   - Do NOT use any title suggesting formal placement (e.g., "Placement Intern", "Verified Co-op")
   - Tailor bullet points to JD tools, mission, and outcomes
   - Focus on measurable results and collaboration
   - Mention relevant technologies from JD
10. DATE CONSTRAINTS: The following dates are verified and MUST remain exactly as listed:
   - Auviel: June 2024 – Present (ALWAYS INCLUDE FIRST)
   - Naija Jollof: January 2024 – June 2024
   - Conestoga-affiliated role: September 2024 – April 2025
   DO NOT shift, round, or rephrase these dates in any way.
11. LOCATION REMOVAL: Do NOT include location information in job titles:
   - ❌ "Frontend Developer - Naija Jollof, Remote"
   - ✅ "Frontend Developer - Naija Jollof"
   - Remove "Remote", city names, and location references from ALL role titles
12. FREELANCE DATE FLEXIBILITY: Freelance work should use flexible date ranges:
   - Overall window: January 2024 – April 2025
   - Choose realistic start and end dates within this window
   - Duration can vary: 1-6 months per project
   - Ensure dates DO NOT overlap with fixed roles:
     * Auviel: June 2024 – Present
     * Naija Jollof: January 2024 – June 2024
     * Conestoga: September 2024 – April 2025
   - Select 1-2 most relevant clients from verified list

TECHNICAL SKILLS EXTRACTION & ORGANIZATION:
STEP 1: Extract ALL technologies, tools, platforms, and practices mentioned in the job description
STEP 2: Categorize them into EXACTLY these 4 categories:

**Languages**: Programming and scripting languages ONLY
- Examples: JavaScript, TypeScript, Python, Java, C#, PHP, SQL, HTML, CSS
- Include only actual programming languages, not frameworks or libraries

**Frameworks**: Frontend/backend libraries and frameworks
- Examples: React, Next.js, Vue.js, Angular, Node.js, Express, Django, Laravel, Tailwind CSS, Bootstrap
- Include UI libraries, component libraries, and web frameworks

**Tools & Platforms**: Development tools, cloud platforms, databases, and infrastructure
- Examples: AWS, Azure, Google Cloud, GitHub, GitLab, Docker, Kubernetes, Firebase, MongoDB, PostgreSQL, Figma, Jira
- Include cloud services, databases, version control, design tools, project management

**Practices**: Development methodologies, workflows, and practices
- Examples: Agile, Scrum, CI/CD, TDD, DevOps, Responsive Design, Accessibility, SEO, API Design
- Include methodologies, best practices, and development approaches

SKILLS PRIORITIZATION RULES:
1. FIRST: Include ALL technologies explicitly mentioned in the job description
2. SECOND: Add Valentine's core technologies (React, Next.js, TypeScript, JavaScript)
3. THIRD: Include industry-standard complements (Git, HTML, CSS for frontend roles)
4. AVOID: Technologies not mentioned in JD unless they're essential industry standards
5. LIMIT: 4-8 items per category for readability

BULLET POINT GUIDELINES FOR ATS OPTIMIZATION:

1. **UNIQUE ACTION VERBS**: Start each bullet with a different action verb within each role
   - Use strong, specific verbs: Developed, Engineered, Optimized, Implemented, Automated, Deployed, Refactored, Designed, Built, Led
   - Avoid weak verbs: "Helped", "Worked on", "Assisted with", "Was responsible for"
   - NO REPETITION of verbs across the entire resume

2. **STRUCTURED FORMAT**: Follow this pattern for every bullet:
   [SPECIFIC ACTION] + [HOW/TECHNOLOGY USED] + [QUANTIFIABLE RESULT/IMPACT]
   
   Examples:
   ✅ "Developed responsive web components using React and TypeScript, improving mobile user engagement by 25%"
   ✅ "Optimized database queries with PostgreSQL indexing, reducing page load times from 3.2s to 1.1s"
   ✅ "Implemented automated CI/CD pipeline with GitHub Actions, cutting deployment time by 60%"

3. **QUANTIFIABLE IMPACT**: Include metrics whenever possible
   - Performance: "reduced by X%", "improved by X%", "increased from X to Y"
   - Time: "cut deployment time by X minutes", "reduced load time by X seconds"
   - Scale: "serving X+ users", "processing X+ requests", "managing X+ components"
   - Quality: "achieved X% test coverage", "reduced bugs by X%"

4. **JOB DESCRIPTION KEYWORD INTEGRATION**:
   - Extract specific technologies, tools, and practices from the JD
   - Use EXACT terminology from the job posting
   - Include frameworks, languages, and methodologies mentioned in JD
   - Match the technical depth and complexity level of the target role

5. **AVOID BUZZWORDS AND FLUFF**:
   ❌ Eliminate: "cross-functional", "synergy", "cutting-edge", "dynamic", "innovative", "leveraged", "utilized", "responsible for"
   ✅ Replace with: specific technologies, concrete actions, measurable outcomes

6. **TENSE CONSISTENCY**:
   - Past roles: Use past tense ("Developed", "Built", "Implemented")
   - Current role (Auviel): Use present tense ("Develop", "Build", "Implement")
   - Projects: Use present tense ("Building", "Developing", "Maintaining")

7. **COLLABORATION AND CONTEXT**:
   - Include specific team context: "with design team", "alongside backend engineers", "for client stakeholders"
   - Mention real challenges solved, not just features built
   - Show progression and learning in academic/co-op roles

BULLET WRITING EXAMPLES BY ROLE TYPE:

TECHNICAL ROLES:
✅ "Architected microservices backend using Node.js and Docker, supporting 10k+ concurrent users"
✅ "Refactored legacy jQuery codebase to React components, reducing bundle size by 35%"
✅ "Deployed automated testing suite with Jest and Cypress, achieving 90% code coverage"

FRONTEND ROLES:
✅ "Built responsive dashboard interface with React and Tailwind CSS, improving mobile usability scores by 40%"
✅ "Optimized image loading with lazy loading and WebP compression, reducing page load time by 2.1 seconds"
✅ "Implemented accessibility features following WCAG 2.1 guidelines, achieving AA compliance"

FULL STACK ROLES:
✅ "Developed RESTful API endpoints with Express.js and PostgreSQL, handling 5k+ daily transactions"
✅ "Integrated third-party payment processing with Stripe API, reducing checkout abandonment by 22%"
✅ "Built real-time notification system using WebSockets, increasing user engagement by 18%"

CONESTOGA ROLE EXAMPLES:
✅ "Built automated intake system for campus resource hub using TypeScript and Supabase, reducing student ticket backlog by 30%"
✅ "Developed internal analytics dashboard with React and Firebase, improving resource allocation efficiency by 25%"
✅ "Implemented accessibility features for student portal following WCAG guidelines, achieving AA compliance"
✅ "Collaborated with faculty to optimize database queries, reducing report generation time from 45 to 12 seconds"
✅ "Designed mobile-first UI components for student application, increasing form completion rate by 22%"

FREELANCE ROLES:
✅ "Designed e-commerce platform for local bakery using Shopify and custom CSS, increasing online sales by 45%"
✅ "Built restaurant ordering system with Next.js and Firebase, reducing order processing time by 3 minutes"
✅ "Implemented SEO optimization strategies, improving Google search ranking from page 3 to page 1"

FABRICATED LOCAL ROLES:
✅ "Contributed to client website redesigns using WordPress and custom PHP, improving site speed scores by 30%"
✅ "Assisted in mobile app development with React Native, learning agile development practices"
✅ "Supported database migration from MySQL to PostgreSQL, gaining experience with data transformation"

8. **SENTENCE STRUCTURE VARIETY**: Vary sentence patterns within each role
   - Challenge-Solution: "Solved X performance bottleneck by implementing Y, resulting in Z improvement"
   - Technology-Focus: "Built X feature using Y technology, enabling Z capability"
   - Outcome-First: "Achieved X% improvement in Y metric through Z implementation"
   - Collaboration: "Partnered with X team to deliver Y solution, resulting in Z outcome"
   - Process: "Streamlined X workflow by implementing Y, reducing Z by N%"

9. **REALISTIC METRICS GUIDELINES**:
   - Performance improvements: 15-50%
   - Load time reductions: 20-60% (or specific seconds: 2.1s to 0.8s)
   - User engagement: 10-35%
   - Code coverage: 70-95%
   - Build/deployment time: 25-70%
   - Error rate reductions: 30-80%
   - SEO improvements: ranking improvements, traffic increases
   - Conversion rates: 5-25%

10. **TECHNOLOGY SPECIFICITY**:
    - Instead of "JavaScript framework" → "React with TypeScript"
    - Instead of "database" → "PostgreSQL with Prisma ORM"
    - Instead of "cloud platform" → "AWS EC2 and S3"
    - Instead of "testing" → "Jest unit tests and Cypress E2E"

RETURN FORMAT - JSON ONLY:
{
  "jobTitle": "{jobTitle}",
  "location": "EXACT location extracted from job description or Remote",
  "summary": "3-line professional summary with keywords and realistic metrics",
  "skills": {
    "Languages": ["JD languages first", "JavaScript", "TypeScript", "HTML", "CSS"],
    "Frameworks": ["JD frameworks first", "React", "Next.js"],
    "Tools & Platforms": ["JD tools first", "GitHub", "essential tools"],
    "Practices": ["JD practices first", "Agile", "Testing", "CI/CD"]
  },
  "experience": [
    {
      "title": "Intelligent Job Title - Auviel",
      "period": "June 2024 - Present",
      "bullets": [
        "UNIQUE action verb + specific technical achievement + realistic metric + JD technologies",
        "DIFFERENT action verb + collaboration/process improvement + measurable outcome",
        "VARIED action verb + user/performance impact + specific technology"
      ],
      "mandatory": true,
      "order": 1
    },
    {
      "title": "Intelligent Job Title - Naija Jollof",
      "period": "January 2024 - June 2024",
      "bullets": [
        "UNIQUE action verb + web development achievement + realistic metric",
        "DIFFERENT action verb + team collaboration + specific outcome",
        "VARIED action verb + performance improvement + technology details"
      ],
      "mandatory": true,
      "order": 2
    },
    {
      "title": "Safe Conestoga Title - [Conestoga Organization]",
      "period": "September 2024 - April 2025",
      "bullets": [
        "UNIQUE action verb + academic/technical achievement + modest metric + JD technologies",
        "DIFFERENT action verb + collaboration/learning + academic context",
        "VARIED action verb + skill development + measurable outcome"
      ],
      "mandatory": true,
      "order": 3
    },
    {
      "title": "Freelance Role Title - [Real Client]",
      "period": "[Flexible Date Range within Jan 2024 - Apr 2025]",
      "bullets": [
        "UNIQUE action verb + specific technical contribution + realistic metric + JD technologies",
        "DIFFERENT action verb + client collaboration or business impact + measurable outcome",
        "VARIED action verb + technical solution or process improvement + specific technology"
      ],
      "freelance": true,
      "client": "real",
      "order": 4
    },
    {
      "title": "Additional Role - [Company]",
      "period": "[Earlier Date Range]",
      "bullets": [
        "UNIQUE action verb + relevant technical work + modest metric + JD technologies",
        "DIFFERENT action verb + collaboration or learning + specific context"
      ],
      "optional": true,
      "order": 5
    }
  ],
  "projects": [
    {
      "title": "GeoEvent",
      "period": "Ongoing",
      "bullets": [
        "UNIQUE action verb + geolocation event aggregation + technical details + user impact",
        "DIFFERENT action verb + Google Maps API integration + real-time data + performance",
        "VARIED action verb + mobile-first design + community feedback + development",
        "OPTIONAL 4TH BULLET + additional technical achievement if relevant to JD"
      ]
    },
    {
      "title": "Creator & Developer - ImageMark",
      "period": "Ongoing",
      "bullets": [
        "UNIQUE action verb + watermarking application + technical details + usage metric",
        "DIFFERENT action verb + positioning algorithms + Canvas API + performance",
        "VARIED action verb + user experience + specific technology implementation",
        "OPTIONAL 4TH BULLET + additional technical achievement if relevant to JD"
      ]
    }
  ]
}

CRITICAL VALIDATION:
- Extract ALL technologies from job description and categorize correctly
- Prioritize JD technologies in each skills category
- Analyze JD for experience requirements before deciding on fabricated experience
- If fabricated experience is added, ensure it's realistic and appropriate for the role level
- Verify that EVERY bullet point starts with a DIFFERENT action verb
- NO repeated verbs across ALL bullet points (including fabricated experience)
- VARY sentence structures within each role - avoid templated patterns
- Include only 1-2 realistic metrics per role for credibility
- ELIMINATE buzzwords and replace with specific details
- Use exact keywords from job description
- Make Valentine appear as a top 1% candidate through specific achievements
- Ensure ATS optimization with relevant terms

FINAL CHECK:
1. Skills are extracted from JD and properly categorized into 4 sections
2. Count action verbs - should be 12 UNIQUE verbs if fabricated experience included
3. Verify sentence structure variety within each role
4. Confirm metrics are realistic and limited (1-2 per role)
5. Check that buzzwords are eliminated
6. Ensure specific technologies and collaboration details are included
7. Validate that skills section matches JD requirements exactly`

export function generateResumePrompt(jobTitle: string, companyName: string, jobDescription: string): string {
  return GPT_RESUME_PROMPT_TEMPLATE.replace(/{jobTitle}/g, jobTitle)
    .replace("{companyName}", companyName)
    .replace("{jobDescription}", jobDescription)
}
