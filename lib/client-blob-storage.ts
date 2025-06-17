// Client-side helper to upload files via API routes

export function generateBlobFileName(
  userId: string,
  applicationId: string,
  fileType: "resume" | "cover-letter",
  extension: "pdf" | "docx",
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileName = `${userId}/${applicationId}/${fileType}_${timestamp}.${extension}`
  console.log(`📝 [CLIENT] Generated filename: ${fileName}`)
  return fileName
}

export async function uploadResumeToBlob(
  buffer: Buffer | Uint8Array,
  fileName: string,
  applicationId: string,
  fileType: "pdf" | "docx",
  contentType: string,
): Promise<{ success: boolean; url?: string; actualFileName?: string; error?: string }> {
  try {
    console.log(`📤 [CLIENT] Starting upload via API route...`)
    console.log(`📄 [CLIENT] File: ${fileName}`)
    console.log(`📁 [CLIENT] Application ID: ${applicationId}`)

    // Create FormData
    const formData = new FormData()
    const blob = new Blob([buffer], { type: contentType })
    formData.append("file", blob)
    formData.append("fileName", fileName)
    formData.append("applicationId", applicationId)
    formData.append("fileType", fileType)

    // Upload via API route
    const response = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      console.log(`🎉 [CLIENT] Upload successful!`)
      console.log(`🔗 [CLIENT] Blob URL: ${result.url}`)
      console.log(`📄 [CLIENT] Actual filename: ${result.actualFileName}`)
      return { success: true, url: result.url, actualFileName: result.actualFileName }
    } else {
      console.error(`❌ [CLIENT] Upload failed:`, result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error(`❌ [CLIENT] Upload error:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function uploadCoverLetterToBlob(
  buffer: Buffer | Uint8Array,
  fileName: string,
  applicationId: string,
  fileType: "pdf" | "docx",
  contentType: string,
): Promise<{ success: boolean; url?: string; actualFileName?: string; error?: string }> {
  try {
    console.log(`📤 [CLIENT] Starting cover letter upload via API route...`)
    console.log(`📄 [CLIENT] File: ${fileName}`)
    console.log(`📁 [CLIENT] Application ID: ${applicationId}`)

    // Create FormData
    const formData = new FormData()
    const blob = new Blob([buffer], { type: contentType })
    formData.append("file", blob)
    formData.append("fileName", fileName)
    formData.append("applicationId", applicationId)
    formData.append("fileType", fileType)

    // Upload via API route
    const response = await fetch("/api/upload-cover-letter", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      console.log(`🎉 [CLIENT] Cover letter upload successful!`)
      console.log(`🔗 [CLIENT] Blob URL: ${result.url}`)
      console.log(`📄 [CLIENT] Actual filename: ${result.actualFileName}`)
      return { success: true, url: result.url, actualFileName: result.actualFileName }
    } else {
      console.error(`❌ [CLIENT] Cover letter upload failed:`, result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error(`❌ [CLIENT] Cover letter upload error:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
