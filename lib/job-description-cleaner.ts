/**
 * Cleans and optimizes a job description to reduce token usage
 * by removing common boilerplate and unnecessary sections
 */
export function cleanJobDescription(jobDescription: string): string {
  if (!jobDescription) return ""

  // Remove common boilerplate sections
  let cleaned = jobDescription
    // Remove company description sections
    .replace(
      /(?:About (?:the )?(?:company|us|organization)|Company Description)[\s\S]*?(?=Requirements|Responsibilities|Qualifications|What you'll do|The Role|About the Role|Job Description|Skills|Experience|We're looking for)/i,
      "",
    )
    // Remove benefits sections
    .replace(
      /(?:Benefits|Perks|What we offer|We offer|Compensation|Salary)[\s\S]*?(?=Apply|Join us|Why join|How to apply|Next steps|About you|$)/i,
      "",
    )
    // Remove equal opportunity statements
    .replace(/(?:Equal Opportunity|EEO|We are an equal|Diversity|Inclusion)[\s\S]*?(?=Apply|Join us|$)/i, "")
    // Remove application instructions
    .replace(/(?:How to Apply|Application Process|To Apply|Apply Now)[\s\S]*?$/i, "")

  // Collapse multiple whitespace characters
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim()

  // Ensure we're not removing too much content
  if (cleaned.length < jobDescription.length * 0.3) {
    // If we've removed more than 70% of the content, something might be wrong
    // Return a more conservative cleaning
    return jobDescription.replace(/\s{2,}/g, " ").trim()
  }

  return cleaned
}
