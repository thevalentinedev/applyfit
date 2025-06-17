"use server"

import { createClient } from "@/lib/supabase/server"
import { verifySession } from "@/lib/dal"

export async function storeResumeFile(
  applicationId: string,
  fileType: "pdf" | "docx",
  blobUrl?: string,
): Promise<{ success: boolean; filePath?: string; fileUrl?: string; error?: string }> {
  try {
    console.log("Storing resume blob URL:", { applicationId, fileType, blobUrl })

    // Verify user session
    const session = await verifySession()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    // Create Supabase client
    const supabase = await createClient()
    const userId = session.user.id

    // Update the job application with the blob URL
    const { data, error } = await supabase
      .from("job_applications")
      .update({
        resume_file_path: blobUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("Database update error:", error)
      throw new Error(`Failed to update job application: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Job application not found or access denied")
    }

    console.log("Successfully stored resume blob URL:", data[0])
    return { success: true, filePath: blobUrl, fileUrl: blobUrl }
  } catch (error) {
    console.error("Error storing resume file:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function storeCoverLetterFile(
  applicationId: string,
  fileType: "pdf" | "docx",
  blobUrl?: string,
): Promise<{ success: boolean; filePath?: string; fileUrl?: string; error?: string }> {
  try {
    console.log("Storing cover letter blob URL:", { applicationId, fileType, blobUrl })

    // Verify user session
    const session = await verifySession()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    // Create Supabase client
    const supabase = await createClient()
    const userId = session.user.id

    // Update the job application with the blob URL
    const { data, error } = await supabase
      .from("job_applications")
      .update({
        cover_letter_file_path: blobUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("Database update error:", error)
      throw new Error(`Failed to update job application: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Job application not found or access denied")
    }

    console.log("Successfully stored cover letter blob URL:", data[0])
    return { success: true, filePath: blobUrl, fileUrl: blobUrl }
  } catch (error) {
    console.error("Error storing cover letter file:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
