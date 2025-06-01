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
          "Development tools, cloud platforms, databases, and infrastructure (AWS, GitHub, Docker, Firebase, etc.)",
        Practices: "Development methodologies, workflows, and practices (Agile, CI/CD, TDD, Responsive Design, etc.)",
      },
      instructions: "Extract and organize skills from JD into exactly these 4 categories, prioritizing JD requirements",
    },

    professionalExperience: [
      {
        company: "GeoEvent",
        baseRole: "Frontend Engineer",
        location: "Remote",
        period: "Jan 2024 - Present",
        instructions: [
          "Generate a role title that aligns with the target JD (e.g., 'Frontend Engineer', 'Software Engineer', 'Full Stack Developer')",
          "Create 2-3 bullets showcasing relevant technical achievements with metrics",
          "Include technologies and practices mentioned in the JD",
          "Highlight scalability, performance, and user experience improvements",
        ],
      },
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
        title: "Creator & Developer - ImageMark",
        location: "Remote",
        period: "Ongoing",
        instructions: [
          "Highlight technical architecture and scalability (10k+ operations)",
          "Emphasize relevant technologies from the JD (React, TypeScript, Canvas API)",
          "Show product thinking and user-focused development",
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
  {
    type: "internship",
    company: "TechStart Solutions",
    baseRole: "Software Development Intern",
    location: "Remote",
    period: "May 2023 - Aug 2023",
    description: "Summer internship focused on web development and software engineering fundamentals",
  },
  {
    type: "hackathon",
    company: "Hack the North 2024",
    baseRole: "Team Lead & Full Stack Developer",
    location: "Waterloo, ON",
    period: "Sep 2024",
    description: "Led development team in 48-hour hackathon building innovative web application",
  },
  {
    type: "capstone",
    company: "Conestoga College Capstone Project",
    baseRole: "Lead Developer",
    location: "Waterloo, ON",
    period: "Sep 2024 - Dec 2024",
    description: "Academic capstone project developing full-stack web application for real client",
  },
  {
    type: "freelance",
    company: "Freelance Development",
    baseRole: "Frontend Developer",
    location: "Remote",
    period: "Jun 2023 - Dec 2023",
    description: "Independent contractor building websites and web applications for small businesses",
  },
  {
    type: "indie",
    company: "Personal Project",
    baseRole: "Creator & Developer",
    location: "Remote",
    period: "Mar 2023 - Aug 2023",
    description: "Independent development of productivity web application with user authentication",
  },
] as const

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
9. SMART EXPERIENCE INJECTION: If JD requires 2+ years/"mid-level"/"senior" experience, add 1 fabricated experience

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

BULLET QUALITY REQUIREMENTS:
- VARY SENTENCE STRUCTURE across bullets within each role
- AVOID BUZZWORDS: "cross-functional", "cutting-edge", "dynamic", "responsible for", "utilized", "leveraged"
- FOCUS ON REAL OUTCOMES: user experience, performance, SEO, accessibility, team efficiency
- USE SPECIFIC TECHNOLOGIES from the job description
- INCLUDE COLLABORATION DETAILS: "with design team", "alongside backend engineers"
- MENTION REAL CHALLENGES SOLVED, not just features built

SENTENCE STRUCTURE VARIETY:
1. Challenge-Solution: "Solved X performance issue by implementing Y, reducing Z by 30%"
2. Outcome-Focused: "Improved user engagement through responsive design and accessibility features"
3. Collaboration: "Partnered with design team to deliver pixel-perfect components using Figma specs"
4. Technical Deep-Dive: "Refactored legacy codebase from jQuery to React, modernizing 15+ components"
5. Process Improvement: "Streamlined deployment pipeline with GitHub Actions, cutting release time by 40%"
6. User Impact: "Enhanced mobile experience for 5k+ daily users through progressive web app features"

REALISTIC METRICS GUIDELINES:
- Performance improvements: 15-50%
- Load time reductions: 20-60%
- User engagement: 10-35%
- Code coverage: 70-95%
- Build time improvements: 25-70%
- Error rate reductions: 30-80%
- Team productivity: 15-40%

EXPERIENCE INJECTION LOGIC:
Analyze the job description for experience requirements:
- If JD mentions "2+ years", "3+ years", "mid-level", "senior", "experienced" OR similar
- AND Valentine's current experience seems insufficient (only 2 real roles)
- THEN inject 1 additional realistic experience from these templates:

FABRICATED EXPERIENCE OPTIONS:
1. "Software Development Intern - TechStart Solutions, Remote (May 2023 - Aug 2023)"
2. "Team Lead & Full Stack Developer - Hack the North 2024, Waterloo, ON (Sep 2024)"
3. "Lead Developer - Conestoga College Capstone Project, Waterloo, ON (Sep 2024 - Dec 2024)"
4. "Frontend Developer - Freelance Development, Remote (Jun 2023 - Dec 2023)"
5. "Creator & Developer - Personal Project, Remote (Mar 2023 - Aug 2023)"

Choose the most appropriate option based on the JD requirements and generate 2-3 realistic bullets:
- Use technologies mentioned in the JD
- Include modest but believable metrics (e.g., "improved performance by 25%", "collaborated with 3-person team")
- Focus on learning, collaboration, and foundational skills
- Avoid unrealistic claims or major business impact

ACTION VERB REQUIREMENTS:
- EVERY bullet point MUST start with a DIFFERENT action verb
- Use strong, varied verbs from these categories:
  * Technical: Architected, Engineered, Refactored, Deployed, Configured, Migrated, Integrated, Automated, Containerized, Modernized
  * Performance: Optimized, Accelerated, Streamlined, Enhanced, Improved, Reduced, Eliminated, Minimized, Boosted, Scaled
  * Leadership: Led, Spearheaded, Coordinated, Mentored, Guided, Facilitated, Orchestrated, Championed, Initiated, Launched
  * Innovation: Designed, Pioneered, Developed, Created, Invented, Prototyped, Conceptualized, Transformed, Reimagined
  * Delivery: Delivered, Shipped, Released, Completed, Achieved, Executed, Implemented, Established, Built, Produced

LOCATION EXTRACTION RULES:
- If job description mentions "Remote" or "Remote work" → use "Remote"
- If job description specifies a city/location (e.g., "Toronto, ON", "New York, NY") → use that exact location
- If job description mentions "Hybrid" with a location → use the location (e.g., "Toronto, ON")
- If no clear location is found → default to "Remote"

BULLET WRITING EXAMPLES:
✅ EXCELLENT: "Refactored legacy jQuery codebase to React, reducing bundle size by 35% and improving load times"
✅ EXCELLENT: "Partnered with UX team to implement responsive design system, enhancing mobile experience for 3k+ users"
✅ EXCELLENT: "Deployed automated testing pipeline with Jest and Cypress, catching 90% of bugs before production"
✅ EXCELLENT: "Solved complex state management issues by migrating to Redux Toolkit, simplifying 12 components"

❌ AVOID: "Built scalable web applications using modern technologies"
❌ AVOID: "Responsible for developing user-friendly interfaces"
❌ AVOID: "Utilized cutting-edge frameworks to deliver dynamic solutions"
❌ AVOID: "Worked cross-functionally to implement best practices"

CANDIDATE PROFILE:
Name: Valentine Ohalebo
Email: hello@valentine.dev
Portfolio: valentine.dev
LinkedIn: https://www.linkedin.com/in/valentine-ohalebo-51bb37221/
GitHub: https://github.com/thevalentinedev
Education: Ontario College Diploma, Computer Programming - 2025, Conestoga College
Current Projects: GeoEvent (geoevent.ca), Naija Jollof (naijajollofw.ca), ImageMark (imagemark.app)

TARGET JOB DESCRIPTION:
{jobDescription}

RESUME STRUCTURE:

HEADER:
Valentine Ohalebo - {jobTitle}
[EXACT Location from JD] • hello@valentine.dev • valentine.dev
LinkedIn | GitHub

PROFESSIONAL SUMMARY:
Write 3 compelling lines that:
- Position Valentine as an ideal candidate for this specific role
- Include 2-3 key technologies/skills from the JD
- Mention quantified impact (e.g., "10k+ operations", "scalable systems")
- Use keywords that will pass ATS screening

TECHNICAL SKILLS:
Organize into 4 categories, prioritizing JD requirements:
- **Languages**: [Most relevant languages from JD first, then JavaScript, TypeScript]
- **Frameworks**: [JD frameworks first, then React, Next.js]
- **Tools & Platforms**: [JD tools first, then GitHub, essential tools]
- **Practices**: [JD practices first, then Agile, Testing, CI/CD]

PROFESSIONAL EXPERIENCE:

1. [INTELLIGENT JOB TITLE] - GeoEvent, Remote (Jan 2024 - Present)
   Generate a relevant title like "Frontend Engineer", "Software Engineer", or "Full Stack Developer" based on JD
   • [UNIQUE ACTION VERB] + specific technical achievement with realistic metric + JD technologies
   • [DIFFERENT ACTION VERB] + collaboration or process improvement + measurable outcome
   • [VARIED ACTION VERB] + user/performance impact + specific technology implementation

2. [INTELLIGENT JOB TITLE] - Naija Jollof, Remote (Feb 2024 - May 2025)  
   Generate a complementary title showing career progression
   • [UNIQUE ACTION VERB] + web development achievement with SEO/accessibility focus + realistic metric
   • [DIFFERENT ACTION VERB] + team collaboration or technical leadership + specific outcome
   • [VARIED ACTION VERB] + performance/user experience improvement + technology details

3. [FABRICATED EXPERIENCE IF NEEDED] - [Company], [Location] ([Period])
   Only include if JD requires 2+ years or mid/senior level experience
   Generate appropriate title based on chosen template and JD requirements
   • [UNIQUE ACTION VERB] + foundational technical achievement + modest realistic metric + JD technologies
   • [DIFFERENT ACTION VERB] + learning/collaboration accomplishment + specific team context
   • [VARIED ACTION VERB] + skill development or project completion + believable outcome

SELECTED PROJECTS:

Creator & Developer - ImageMark, Remote (Ongoing)
• [UNIQUE ACTION VERB] + watermarking application with specific technical details + realistic usage metric
• [DIFFERENT ACTION VERB] + smart positioning algorithms using Canvas API + performance improvement
• [VARIED ACTION VERB] + user experience enhancement + specific technology implementation

EDUCATION:
Ontario College Diploma, Computer Programming - 2025
Conestoga College - Waterloo, ON
• GPA: 3.92 (High Distinction)
• Relevant Coursework: Web Development, OOP, UI/UX Design, Data Structures
• Academic Excellence: Best Final Year Project, Tech Showcase 2025, Best of Program Award

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
      "title": "Intelligent Job Title - GeoEvent, Remote",
      "period": "Jan 2024 - Present",
      "bullets": [
        "UNIQUE action verb + specific technical achievement + realistic metric + JD technologies",
        "DIFFERENT action verb + collaboration/process improvement + measurable outcome",
        "VARIED action verb + user/performance impact + specific technology"
      ]
    },
    {
      "title": "Intelligent Job Title - Naija Jollof, Remote",
      "period": "Feb 2024 - May 2025",
      "bullets": [
        "UNIQUE action verb + web development achievement + realistic metric",
        "DIFFERENT action verb + team collaboration + specific outcome",
        "VARIED action verb + performance improvement + technology details"
      ]
    },
    {
      "title": "Fabricated Experience Title - Company, Location",
      "period": "Period",
      "bullets": [
        "UNIQUE action verb + foundational achievement + modest metric",
        "DIFFERENT action verb + learning/collaboration + team context",
        "VARIED action verb + skill development + believable outcome"
      ],
      "fabricated": true
    }
  ],
  "projects": [
    {
      "title": "Creator & Developer - ImageMark, Remote",
      "period": "Ongoing",
      "bullets": [
        "UNIQUE action verb + watermarking application + technical details + usage metric",
        "DIFFERENT action verb + positioning algorithms + Canvas API + performance",
        "VARIED action verb + user experience + specific technology implementation"
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
