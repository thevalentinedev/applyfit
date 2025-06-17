export function formatResumeForScoring(resume: any): string {
  if (typeof resume === "string") {
    return resume
  }

  // Format structured resume data into text for ATS analysis
  const sections = []

  // Header/Contact Info
  if (resume.candidateInfo) {
    sections.push(`CONTACT INFORMATION:
Name: ${resume.candidateInfo.name || "Not provided"}
Email: ${resume.candidateInfo.email || "Not provided"}
Phone: ${resume.candidateInfo.phone || "Not provided"}
Location: ${resume.location || "Not provided"}
Website: ${resume.candidateInfo.website || "Not provided"}
LinkedIn: ${resume.candidateInfo.linkedin || "Not provided"}
GitHub: ${resume.candidateInfo.github || "Not provided"}`)
  }

  // Professional Summary
  if (resume.summary) {
    sections.push(`PROFESSIONAL SUMMARY:
${resume.summary}`)
  }

  // Technical Skills
  if (resume.skills && typeof resume.skills === "object") {
    sections.push(`TECHNICAL SKILLS:`)
    Object.entries(resume.skills).forEach(([category, skills]) => {
      if (Array.isArray(skills)) {
        sections.push(`${category}: ${skills.join(", ")}`)
      }
    })
  }

  // Professional Experience
  if (resume.experience && Array.isArray(resume.experience)) {
    sections.push(`PROFESSIONAL EXPERIENCE:`)
    resume.experience.forEach((exp: any) => {
      sections.push(`${exp.title || "Position"} | ${exp.period || "Dates"}`)
      if (exp.bullets && Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet: string) => {
          sections.push(`• ${bullet}`)
        })
      }
    })
  }

  // Projects
  if (resume.projects && Array.isArray(resume.projects)) {
    sections.push(`SELECTED PROJECTS:`)
    resume.projects.forEach((project: any) => {
      sections.push(`${project.title || "Project"} | ${project.period || "Dates"}`)
      if (project.bullets && Array.isArray(project.bullets)) {
        project.bullets.forEach((bullet: string) => {
          sections.push(`• ${bullet}`)
        })
      }
    })
  }

  return sections.join("\n\n")
}