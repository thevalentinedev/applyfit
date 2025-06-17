"use server"

import { createClient } from "@/lib/supabase/server"
import { verifySession } from "@/lib/dal"

export async function storeResumeFile(applicationId: string, resumeContent: string, fileName: string) {
  try {
    const session = await verifySession()
    if (!session) {
      return { success: false, error: "User not authenticated" }
    }

    const supabase = await createClient()

    // Create a unique file path
    const filePath = `resumes/${session.userId}/${applicationId}/${fileName}`

    // Store the resume content (this could be enhanced to use Supabase Storage)
    // For now, we'll store the file path and update the application record
    const { data, error } = await supabase
      .from("job_applications")
      .update({
        resume_file_path: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("user_id", session.userId)
      .select()
      .single()

    if (error) {
      console.error("Failed to store resume file path:", error)
      return { success: false, error: "Failed to store resume information" }
    }

    return { success: true, data, filePath }
  } catch (error) {
    console.error("Error storing resume file:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateApplicationStatus(applicationId: string, status: string, notes?: string) {
  try {
    const session = await verifySession()
    if (!session) {
      return { success: false, error: "User not authenticated" }
    }

    const supabase = await createClient()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (notes) {
      updateData.application_notes = notes
    }

    const { data, error } = await supabase
      .from("job_applications")
      .update(updateData)
      .eq("id", applicationId)
      .eq("user_id", session.userId)
      .select()
      .single()

    if (error) {
      console.error("Failed to update application status:", error)
      return { success: false, error: "Failed to update application status" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error updating application status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
