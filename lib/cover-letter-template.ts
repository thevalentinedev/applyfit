const template = `
{candidateName}
{candidateEmail}
{candidatePhone}
{candidateWebsite}
{candidateLinkedIn}
{candidateGitHub}

[Date]

Dear Hiring Manager,

I am writing to express my strong interest in the {jobTitle} position at {companyName}. With my background in {candidateExpertise}, I am excited about the opportunity to contribute to your team.

[Dynamic content based on user experience and job requirements]

Best regards,
{candidateName}
`

export function formatUserProfileForCoverLetter(userProfile: any, jobDetails: any) {
  return template
    .replace("{candidateName}", userProfile?.full_name || "Your Name")
    .replace("{candidateEmail}", userProfile?.email || "your.email@example.com")
    .replace("{candidatePhone}", userProfile?.phone || "Your Phone")
    .replace("{candidateWebsite}", userProfile?.website || "Your Website")
    .replace("{candidateLinkedIn}", userProfile?.linkedin_url || "Your LinkedIn")
    .replace("{candidateGitHub}", userProfile?.github_url || "Your GitHub")
    .replace("{jobTitle}", jobDetails?.title || "Position")
    .replace("{companyName}", jobDetails?.company || "Company")
    .replace("{candidateExpertise}", userProfile?.professional_summary || "relevant experience")
}
