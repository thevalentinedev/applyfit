"use server"

import * as cheerio from "cheerio"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { cleanJobDescription } from "@/lib/job-description-cleaner"

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

    // Clean the HTML and extract text content
    const $ = cheerio.load(html)

    // Remove script tags, style tags, and other non-content elements
    $("script, style, nav, footer, header, .ad, .advertisement").remove()

    // Get the main content text
    const pageText = $("body").text().replace(/\s+/g, " ").trim()

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
    const $ = cheerio.load(html)

    // Enhanced job title extraction with more selectors
    let jobTitle = ""
    const titleSelectors = [
      'h1[data-test-id="job-title"]',
      "h1.job-details-jobs-unified-top-card__job-title",
      "h1.jobs-unified-top-card__job-title",
      ".job-details-jobs-unified-top-card__job-title h1",
      ".jobs-unified-top-card__job-title h1",
      'h1[class*="job-title"]',
      'h1[class*="top-card"]',
      'meta[property="og:title"]',
      "title",
    ]

    for (const selector of titleSelectors) {
      if (selector.includes("meta")) {
        const content = $(selector).attr("content")
        if (content && !content.includes("LinkedIn")) {
          jobTitle = content.split(" | ")[0].trim()
        }
      } else if (selector === "title") {
        const titleText = $(selector).text()
        if (titleText) {
          // Extract job title from page title (usually "Job Title | Company | LinkedIn")
          const parts = titleText.split(" | ")
          if (parts.length > 0) {
            jobTitle = parts[0].trim()
          }
        }
      } else {
        jobTitle = $(selector).text().trim()
      }
      if (jobTitle && jobTitle.length > 3 && !jobTitle.toLowerCase().includes("linkedin")) break
    }

    // Enhanced company name extraction
    let companyName = ""
    const companySelectors = [
      'a[data-test-id="job-details-company-name"]',
      ".job-details-jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__company-name a",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name",
      'a[class*="company-name"]',
      '[data-test-id*="company"]',
    ]

    for (const selector of companySelectors) {
      companyName = $(selector).text().trim()
      if (companyName && companyName.length > 1) break
    }

    // Enhanced location extraction
    let location = ""
    const locationSelectors = [
      '[data-test-id="job-details-location"]',
      ".job-details-jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet",
      '[class*="location"]',
      '[data-test-id*="location"]',
    ]

    for (const selector of locationSelectors) {
      location = $(selector).first().text().trim()
      if (location && location.length > 2) break
    }

    // Enhanced description extraction
    let description = ""
    const descriptionSelectors = [
      '[data-test-id="job-details-description"]',
      ".job-details-jobs-unified-top-card__description-container",
      ".jobs-unified-top-card__description-container",
      ".description__text",
      ".job-details-jobs-unified-top-card__description",
      '[class*="description"]',
      "#job-details",
    ]

    for (const selector of descriptionSelectors) {
      description = $(selector).text().trim()
      if (description && description.length > 100) break
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
