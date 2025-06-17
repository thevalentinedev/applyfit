"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { cleanJobDescription } from "@/lib/job-description-cleaner"

// We'll use native DOM parsing instead of cheerio

export type JobDetails = {
  jobTitle: string
  companyName: string
  location: string
  description: string
  success: boolean
  error?: string
}

async function extractJobDetailsWithGPT(html: string, url: string): Promise<JobDetails> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return {
        jobTitle: "Unknown Job Title",
        companyName: "Unknown Company",
        location: "Unknown Location",
        description: "OpenAI API key not configured",
        success: false,
        error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.",
      }
    }

    // Clean the HTML and extract text content using native parsing
    const cleanedHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    const pageText = cleanedHtml

    // Limit the text to avoid token limits (first 3000 characters should contain job info)
    const limitedText = pageText.substring(0, 3000)

    const prompt = `Extract job details from this LinkedIn job posting text. Return ONLY a JSON object with no additional text.

Text from LinkedIn page:
${limitedText}

Extract these fields:
- jobTitle: The exact job title (e.g., "Software Engineer, Frontend - Canada")
- companyName: The company name (e.g., "DoorDash")
- location: The job location (e.g., "Toronto, ON")
- description: The job description text (everything under "About the Role" or job description section)

Return only this JSON format:
{
  "jobTitle": "exact job title here",
  "companyName": "company name here", 
  "location": "location here",
  "description": "full job description here"
}`

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt,
      temperature: 0.1,
      maxTokens: 1000,
    })

    // Parse the JSON response with better error handling
    let extractedData
    try {
      const cleanedText = text.trim()
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error("No valid JSON found in GPT response")
      }

      extractedData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      return {
        jobTitle: "Unknown Job Title",
        companyName: "Unknown Company",
        location: "Unknown Location",
        description: "Could not parse job details from response",
        success: false,
        error: "Failed to parse job details from AI response",
      }
    }

    return {
      jobTitle: extractedData.jobTitle || "Unknown Job Title",
      companyName: extractedData.companyName || "Unknown Company",
      location: extractedData.location || "Unknown Location",
      description: cleanJobDescription(extractedData.description || "Could not extract job description"),
      success: true,
    }
  } catch (error) {
    console.error("Error extracting with GPT:", error)
    throw error
  }
}

export async function parseLinkedInJob(url: string): Promise<JobDetails> {
  try {
    // Input validation
    if (!url || typeof url !== "string") {
      throw new Error("Invalid URL provided")
    }

    // Validate URL format
    if (!url.startsWith("https://www.linkedin.com/jobs/view/")) {
      throw new Error("Invalid LinkedIn job URL format")
    }

    // Attempt to fetch the LinkedIn job post
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch job post: ${response.status}`)
    }

    const html = await response.text()

    // Enhanced job title extraction with regex patterns
    let jobTitle = ""
    const titlePatterns = [
      /<h1[^>]*data-test-id="job-title"[^>]*>(.*?)<\/h1>/i,
      /<h1[^>]*class="[^"]*job-title[^"]*"[^>]*>(.*?)<\/h1>/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i,
      /<title[^>]*>(.*?)<\/title>/i,
    ]

    for (const pattern of titlePatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        jobTitle = match[1].replace(/<[^>]+>/g, "").trim()
        if (jobTitle && jobTitle.length > 3 && !jobTitle.toLowerCase().includes("linkedin")) {
          // Clean up title (remove " | Company | LinkedIn" suffix)
          jobTitle = jobTitle.split(" | ")[0].trim()
          break
        }
      }
    }

    // Enhanced company name extraction
    let companyName = ""
    const companyPatterns = [
      /<a[^>]*data-test-id="job-details-company-name"[^>]*>(.*?)<\/a>/i,
      /<a[^>]*class="[^"]*company-name[^"]*"[^>]*>(.*?)<\/a>/i,
      /<div[^>]*class="[^"]*company-name[^"]*"[^>]*>(.*?)<\/div>/i,
    ]

    for (const pattern of companyPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        companyName = match[1].replace(/<[^>]+>/g, "").trim()
        if (companyName && companyName.length > 1) break
      }
    }

    // Enhanced location extraction
    let location = ""
    const locationPatterns = [
      /<div[^>]*data-test-id="job-details-location"[^>]*>(.*?)<\/div>/i,
      /<div[^>]*class="[^"]*location[^"]*"[^>]*>(.*?)<\/div>/i,
      /<span[^>]*class="[^"]*bullet[^"]*"[^>]*>(.*?)<\/span>/i,
    ]

    for (const pattern of locationPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        location = match[1].replace(/<[^>]+>/g, "").trim()
        if (location && location.length > 2) break
      }
    }

    // Enhanced description extraction
    let description = ""
    const descriptionPatterns = [
      /<div[^>]*data-test-id="job-details-description"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*id="job-details"[^>]*>([\s\S]*?)<\/section>/i,
    ]

    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        description = match[1]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
        if (description && description.length > 100) break
      }
    }

    // If HTML parsing failed or gave poor results, try GPT extraction
    const needsGPTFallback =
      !jobTitle ||
      !companyName ||
      !location ||
      !description ||
      jobTitle === "Unknown Job Title" ||
      companyName === "Unknown Company" ||
      location === "Unknown Location" ||
      description.length < 100

    if (needsGPTFallback) {
      console.log("HTML parsing incomplete, trying GPT extraction...")
      try {
        const gptResult = await extractJobDetailsWithGPT(html, url)
        return gptResult
      } catch (gptError) {
        console.error("GPT extraction also failed:", gptError)
        // Continue with HTML parsing results as fallback
      }
    }

    // Clean and optimize the job description
    if (description) {
      description = cleanJobDescription(description)
    }

    return {
      jobTitle: jobTitle || "Unknown Job Title",
      companyName: companyName || "Unknown Company",
      location: location || "Unknown Location",
      description: description || "Could not extract job description",
      success: true,
    }
  } catch (error) {
    console.error("Error parsing LinkedIn job:", error)
    return {
      jobTitle: "",
      companyName: "",
      location: "",
      description: "",
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to extract job details. LinkedIn may be blocking our request.",
    }
  }
}
