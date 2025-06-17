import { put } from "@vercel/blob"

export class VercelBlobStorage {
  async uploadFile(
    buffer: Buffer | Uint8Array,
    fileName: string,
    contentType: string,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Check if token is available
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.warn("⚠️ [BLOB] BLOB_READ_WRITE_TOKEN not configured - skipping cloud upload")
        return {
          success: false,
          error: "Vercel Blob token not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.",
        }
      }

      console.log(`📤 [BLOB] Starting upload for: ${fileName}`)
      console.log(`📊 [BLOB] File size: ${buffer.length} bytes`)
      console.log(`📋 [BLOB] Content type: ${contentType}`)

      const blob = await put(fileName, buffer, {
        access: "public",
        contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      console.log(`🎉 [BLOB] Upload successful!`)
      console.log(`🔗 [BLOB] Public URL: ${blob.url}`)
      console.log(`📁 [BLOB] File path: ${fileName}`)

      return { success: true, url: blob.url }
    } catch (error) {
      console.error(`❌ [BLOB] Upload failed for ${fileName}:`, error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }
}

export function generateBlobFileName(
  userId: string,
  applicationId: string,
  fileType: "resume" | "cover-letter",
  extension: "pdf" | "docx",
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileName = `${userId}/${applicationId}/${fileType}_${timestamp}.${extension}`
  console.log(`📝 [BLOB] Generated filename: ${fileName}`)
  return fileName
}
