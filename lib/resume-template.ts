import type { UserProfileData } from "@/app/actions/generate-resume"

// Helper function to format user profile data for the prompt
function formatUserProfileForPrompt(profile: UserProfileData): string {
  const sections = []

  // Basic Information - USING DYNAMIC USER DATA
  sections.push(`CANDIDATE INFORMATION:
Name: ${profile.full_name}
Email: ${profile.email}
Phone: ${profile.phone || "Not provided"}
Location: ${profile.location || "Not specified"}
Website: ${profile.website || "Not provided"}
LinkedIn: ${profile.linkedin_url || "Not provided"}
GitHub: ${profile.github_url || "Not provided"}
Bio: ${profile.bio || "Not provided"}`)

  // Education - USING DYNAMIC USER DATA
  if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) {
    sections.push(`EDUCATION:`)
    profile.education.forEach((edu, index) => {
      sections.push(`${index + 1}. ${edu.degree || "Degree"} in ${edu.field_of_study || "Field"} - ${edu.institution || "Institution"}
   Dates: ${edu.start_date || "Start"} to ${edu.end_date || "End"}
   ${edu.gpa ? `GPA: ${edu.gpa}` : ""}
   ${edu.description || ""}`)
    })
  } else {
    sections.push(`EDUCATION: Not provided - please use general education format`)
  }

  // Professional Experience - USING DYNAMIC USER DATA
  if (
    profile.professional_experience &&
    Array.isArray(profile.professional_experience) &&
    profile.professional_experience.length > 0
  ) {
    sections.push(`PROFESSIONAL EXPERIENCE:`)
    profile.professional_experience.forEach((exp, index) => {
      const endDate = exp.is_current ? "Present" : exp.end_date || "End Date"
      sections.push(`${index + 1}. ${exp.position || "Position"} at ${exp.company || "Company"}
   Location: ${exp.location || "Location"}
   Dates: ${exp.start_date || "Start"} to ${endDate}
   Description: ${exp.description || "No description provided"}`)
    })
  } else {
    sections.push(`PROFESSIONAL EXPERIENCE: Limited professional experience - focus on education, projects, and skills`)
  }

  // Projects and Achievements - USING DYNAMIC USER DATA
  if (
    profile.projects_achievements &&
    Array.isArray(profile.projects_achievements) &&
    profile.projects_achievements.length > 0
  ) {
    sections.push(`PROJECTS & ACHIEVEMENTS:`)
    profile.projects_achievements.forEach((project, index) => {
      const status = project.is_ongoing ? "Ongoing" : `${project.start_date || "Start"} to ${project.end_date || "End"}`
      sections.push(`${index + 1}. ${project.title || "Project Title"}
   Status: ${status}
   Description: ${project.description || "No description provided"}
   Technologies: ${Array.isArray(project.technologies) ? project.technologies.join(", ") : "Not specified"}
   ${project.demo_url ? `Demo: ${project.demo_url}` : ""}
   ${project.github_url ? `GitHub: ${project.github_url}` : ""}`)
    })
  } else {
    sections.push(`PROJECTS & ACHIEVEMENTS: No projects listed - focus on education and any coursework projects`)
  }

  // Skills - USING DYNAMIC USER DATA
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    sections.push(`SKILLS: ${profile.skills.join(", ")}`)
  } else {
    sections.push(`SKILLS: Not specified - extract from education and experience`)
  }

  return sections.join("\n\n")
}

export const GPT_DYNAMIC_RESUME_PROMPT_TEMPLATE = `You are an expert ATS optimization specialist and senior tech recruiter. Create a professional resume for the candidate applying to: "{jobTitle}" at {companyName}.

{userProfileData}

CRITICAL REQUIREMENTS:
1. Use EXACT job title "{jobTitle}" in header - no modifications
2. Extract and return the EXACT location from the job description as a separate field
3. Generate intelligent, relevant job titles for experience based on actual work performed
4. MANDATORY: Use UNIQUE action verbs for EVERY bullet point - NO REPETITION
5. BULLET QUALITY: Create specific, vivid, diverse bullets with real impact from actual experience
6. LIMIT METRICS: Use only realistic metrics based on actual work performed or reasonable estimates
7. JD-ALIGNED SKILLS: Extract and organize skills perfectly from job description
8. Position candidate professionally based on real experience and education
9. ONLY USE REAL EXPERIENCE: Do not fabricate companies, roles, or achievements
10. AUTHENTIC WORK HISTORY: Base all experience on actual work performed at real companies
11. EDUCATION FOCUS: Emphasize academic performance and relevant coursework when experience is limited

HEADER REQUIREMENTS - CRITICAL FOR DYNAMIC DATA:
- Name: Use EXACT name from candidate profile: {candidateName}
- Job Title: Use EXACT job title from job description: {jobTitle}
- Location: Use location from job description OR candidate's location if job location not specified
- Email: Use candidate's email: {candidateEmail}
- Phone: Use candidate's phone if provided: {candidatePhone}
- Website: Use candidate's website if provided: {candidateWebsite}
- LinkedIn: Use candidate's LinkedIn URL if provided (format as "LinkedIn" link): {candidateLinkedIn}
- GitHub: Use candidate's GitHub URL if provided (format as "GitHub" link): {candidateGitHub}

EDUCATION REQUIREMENTS - CRITICAL FOR DYNAMIC DATA:
- Use ONLY the candidate's actual education from their profile
- Do NOT use any hardcoded education information
- Format exactly as provided in candidate's profile
- Include GPA, courses, awards ONLY if provided in candidate's profile
- If no education provided, use general format but mention it's from profile

EXPERIENCE REQUIREMENTS - CRITICAL FOR DYNAMIC DATA:
- Use ONLY the candidate's actual professional experience from their profile
- Do NOT fabricate any work experience
- Use exact company names, positions, and dates from candidate's profile
- Base all bullet points on actual work described in candidate's profile

PROJECTS REQUIREMENTS - CRITICAL FOR DYNAMIC DATA:
- Use ONLY the candidate's actual projects from their profile
- Use exact project titles and descriptions from candidate's profile
- Include actual technologies used as listed in candidate's profile
- Include actual URLs if provided in candidate's profile

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
2. SECOND: Add candidate's core technologies from actual experience and profile
3. THIRD: Include industry-standard complements (Git, HTML, CSS for frontend roles)
4. AVOID: Technologies not mentioned in JD unless they're essential industry standards
5. LIMIT: 4-8 items per category for readability

RETURN FORMAT - JSON ONLY:
{
  "jobTitle": "{jobTitle}",
  "location": "EXACT location extracted from job description or candidate's location",
  "candidateInfo": {
    "name": "{candidateName}",
    "email": "{candidateEmail}",
    "phone": "{candidatePhone}",
    "website": "{candidateWebsite}",
    "linkedin": "{candidateLinkedIn}",
    "github": "{candidateGitHub}"
  },
  "summary": "3-line professional summary with keywords and realistic achievements from actual experience",
  "skills": {
    "Languages": ["JD languages first", "candidate's languages"],
    "Frameworks": ["JD frameworks first", "candidate's frameworks"],
    "Tools & Platforms": ["JD tools first", "candidate's tools"],
    "Practices": ["JD practices first", "candidate's practices"]
  },
  "experience": [
    // Generate experience entries based on candidate's actual professional experience
    // Use the format: "Relevant Job Title - Company Name"
    // Include period from candidate's data
    // Create 2-3 bullets per role using unique action verbs and JD-aligned technologies
  ],
  "projects": [
    // Generate project entries based on candidate's actual projects
    // Use project titles and descriptions from candidate's profile
    // Create 2-4 bullets per project using unique action verbs and JD-aligned technologies
    // Focus on technical achievements and measurable outcomes
  ],
  "education": [
    // Use candidate's actual education from their profile
    // Include degree, institution, dates, GPA, courses, awards as provided
  ]
}

CRITICAL VALIDATION - ENSURE DYNAMIC DATA USAGE:
- Extract ALL technologies from job description and categorize correctly
- Prioritize JD technologies in each skills category
- Base ALL experience on candidate's actual work history from profile
- Use ONLY candidate's actual education information from profile
- Use ONLY candidate's actual contact information from profile
- Use ONLY candidate's actual projects from profile
- Verify that EVERY bullet point starts with a DIFFERENT action verb
- NO repeated verbs across ALL bullet points
- VARY sentence structures within each role - avoid templated patterns
- Include only realistic metrics based on actual work performed or reasonable estimates
- ELIMINATE buzzwords and replace with specific details from real experience
- Use exact keywords from job description
- Present candidate as qualified based on actual achievements from profile
- Ensure ATS optimization with relevant terms from real experience

FINAL CHECK - DYNAMIC DATA VERIFICATION:
1. Skills are extracted from JD and properly categorized into 4 sections
2. Count action verbs - should be UNIQUE across all experience
3. Verify sentence structure variety within each role
4. Confirm metrics are realistic and based on actual work or reasonable estimates
5. Check that buzzwords are eliminated
6. Ensure specific technologies and collaboration details are from real experience
7. Validate that skills section matches JD requirements exactly
8. Confirm all companies and roles are from candidate's actual profile
9. Verify header uses candidate's actual contact information from profile
10. Confirm education section uses candidate's actual education data from profile
11. Verify projects section uses candidate's actual projects from profile
12. Ensure location is from job description (dynamic)
13. Ensure job title is from job description (dynamic)`

export function generateDynamicResumePrompt(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  userProfile: UserProfileData,
): string {
  const userProfileData = formatUserProfileForPrompt(userProfile)

  console.log("🔧 BUILDING DYNAMIC PROMPT WITH USER DATA:", {
    name: userProfile.full_name,
    email: userProfile.email,
    phone: userProfile.phone,
    website: userProfile.website,
    linkedin: userProfile.linkedin_url,
    github: userProfile.github_url,
  })

  return GPT_DYNAMIC_RESUME_PROMPT_TEMPLATE.replace(/{jobTitle}/g, jobTitle)
    .replace("{companyName}", companyName)
    .replace("{jobDescription}", jobDescription)
    .replace("{userProfileData}", userProfileData)
    .replace("{candidateName}", userProfile.full_name || "Candidate Name")
    .replace("{candidateEmail}", userProfile.email || "email@example.com")
    .replace("{candidatePhone}", userProfile.phone || "Not provided")
    .replace("{candidateWebsite}", userProfile.website || "Not provided")
    .replace("{candidateLinkedIn}", userProfile.linkedin_url || "Not provided")
    .replace("{candidateGitHub}", userProfile.github_url || "Not provided")
}

// Remove the old static function completely
export function generateResumePrompt(): never {
  throw new Error(
    "generateResumePrompt is deprecated and removed. Use generateDynamicResumePrompt with user profile data.",
  )
}
