"use server"

import { createClient } from "@/lib/supabase/server"
import { verifySession } from "@/lib/dal"
import { revalidatePath } from "next/cache"

export async function createJobApplication(formData: FormData) {
  try {
    // Verify user session
    const session = await verifySession()
    if (!session) {
      return { success: false, error: "User not authenticated" }
    }

    // Extract and validate form data
    const companyName = formData.get("company_name")?.toString()?.trim()
    const jobTitle = formData.get("job_title")?.toString()?.trim()
    const jobLink = formData.get("job_link")?.toString()?.trim()
    const resumeUrl = formData.get("resume_url")?.toString()?.trim()
    const coverLetter = formData.get("cover_letter")?.toString()?.trim()
    const status = formData.get("status")?.toString()?.trim() || "applied"

    // Validate required fields
    if (!companyName || !jobTitle) {
      return { success: false, error: "Company name and job title are required" }
    }

    // Validate status
    const validStatuses = ["applied", "interviewed", "rejected", "ghosted", "offer", "accepted"]
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status value" }
    }

    const supabase = await createClient()

    console.log("Creating job application with validated data:", {
      user_id: session.userId,
      company_name: companyName,
      job_title: jobTitle,
      job_link: jobLink || null,
      resume_url: resumeUrl || null,
      cover_letter: coverLetter || null,
      status,
    })

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: session.userId,
        company_name: companyName,
        job_title: jobTitle,
        job_link: jobLink || null,
        resume_url: resumeUrl || null,
        cover_letter: coverLetter || null,
        status,
        date_applied: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      })
      .select("id")
      .single()

    if (error) {
      console.error("Detailed job application creation error:", {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      return {
        success: false,
        error: `Failed to create job application: ${error.message || "Unknown error"}`,
      }
    }

    // Revalidate the dashboard page to show the new application
    revalidatePath("/dashboard")

    return { success: true, data }
  } catch (error) {
    console.error("Exception in createJobApplication:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
