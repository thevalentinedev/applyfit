export const COVER_LETTER_TEMPLATE = {
  structure: {
    header: {
      name: "Valentine Ohalebo",
      location: "[Dynamic Location from JD or Remote]",
      contact: "hello@valentine.dev · valentine.dev",
      links: "LinkedIn | Github",
      date: "Date: [GPT: Insert current date formatted like 'May 31, 2025']",
    },
    recipient: {
      hiringManager: "[GPT: Hiring Manager Name or Just 'Hiring Team']",
      company: "[GPT: Company Name]",
      location: "[GPT: Company Location from JD or Remote]",
    },
    greeting: "Dear [GPT: Hiring Manager or Team],",
    body: [
      "[GPT: Hook sentence that ties user's passion to company's mission or product]",
      "[GPT: 2–3 sentences highlighting top skills/achievements aligned with JD]",
      "[GPT: Closing statement with strong CTA, expressing excitement to connect]",
    ],
    closing: "Warm regards,\nValentine Ohalebo",
  },

  content: {
    header: {
      instructions:
        "Use the EXACT job location from the job description - if Remote, use Remote; if specific city, use that city",
    },
    recipient: {
      instructions:
        "Extract company name from job description. Use EXACT location from job description for company location. If hiring manager name is available, use it; otherwise use 'Hiring Team'",
    },
    body: {
      hook: {
        instructions:
          "Create a compelling hook sentence that connects Valentine's passion to the company's mission or product",
        examples: [
          "As a passionate developer with a keen interest in [company focus area], I was excited to discover the [Job Title] opportunity at [Company Name].",
          "Your recent work on [company product/achievement] resonated with my passion for creating impactful digital experiences, prompting me to apply for the [Job Title] position.",
        ],
      },
      skills: {
        instructions: "Highlight 2-3 top skills or achievements that directly align with the job requirements",
        examples: [
          "My experience building responsive web applications with React and Next.js has equipped me with the technical foundation to contribute immediately to your team.",
          "Through my work on ImageMark, I've demonstrated my ability to solve complex problems and deliver user-friendly solutions that prioritize performance and accessibility.",
        ],
      },
      closing: {
        instructions: "Create a strong call-to-action expressing enthusiasm to discuss the role further",
        examples: [
          "I'm excited about the possibility of bringing my technical skills and creative problem-solving to [Company Name] and would welcome the opportunity to discuss how I can contribute to your team's success.",
          "I look forward to the possibility of discussing how my background and enthusiasm align with your team's needs and would be delighted to provide any additional information you require.",
        ],
      },
    },
  },
} as const

export const GPT_COVER_LETTER_PROMPT_TEMPLATE = `I want you to act as a professional cover letter writer with expertise in tech industry applications.
I am applying for the role of "{jobTitle}" at {companyName}.

Below is the job description and my profile information.

MY PROFILE:
Name: Valentine Ohalebo
Email: hello@valentine.dev
Portfolio: valentine.dev
LinkedIn: https://www.linkedin.com/in/valentine-ohalebo-51bb37221/
GitHub: https://github.com/thevalentinedev
Education: Ontario College Diploma, Computer Programming - 2025, Conestoga College - Waterloo, ON
Current Projects: GeoEvent (geoevent.ca), Naija Jollof (naijajollofw.ca), ImageMark (imagemark.app)

JOB DESCRIPTION:
{jobDescription}

LOCATION EXTRACTION RULES:
- If job description mentions "Remote" or "Remote work" → use "Remote"
- If job description specifies a city/location (e.g., "Toronto, ON", "New York, NY") → use that exact location
- If job description mentions "Hybrid" with a location → use the location (e.g., "Toronto, ON")
- If no clear location is found → default to "Remote"

Please generate a cover letter following this EXACT structure and format:

Valentine Ohalebo
[EXACT Location from JD] · hello@valentine.dev · valentine.dev
LinkedIn | Github
Date: {currentDate}

[Hiring Manager Name (if available) or Just 'Hiring Team']
{companyName}
[EXACT Company Location from JD]

Dear [Hiring Manager or Team],

[Hook sentence that ties Valentine's passion to company's mission or product]
[2–3 sentences highlighting top skills/achievements aligned with JD]
[Closing statement with strong CTA, expressing excitement to connect]

Warm regards,
Valentine Ohalebo

Return your response as a JSON object with this exact structure:
{
  "location": "EXACT location from JD or Remote",
  "date": "Current date formatted like 'May 31, 2025'",
  "recipient": {
    "name": "Hiring Manager Name or Hiring Team",
    "company": "Company Name",
    "location": "EXACT company location from JD"
  },
  "greeting": "Dear Hiring Manager or Team,",
  "body": {
    "hook": "Hook sentence that ties passion to company mission",
    "skills": "2-3 sentences highlighting relevant skills and achievements",
    "closing": "Closing statement with call to action"
  }
}

Make sure the JSON is valid and properly formatted. Do not include any text outside the JSON object.`

export function generateCoverLetterPrompt(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  currentDate: string,
): string {
  return GPT_COVER_LETTER_PROMPT_TEMPLATE.replace("{jobTitle}", jobTitle)
    .replace("{companyName}", companyName)
    .replace("{jobDescription}", jobDescription)
    .replace("{currentDate}", currentDate)
}
