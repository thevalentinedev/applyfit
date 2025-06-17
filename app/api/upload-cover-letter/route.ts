import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { storeCoverLetterFile } from "@/app/actions/store-resume-file"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [API] Starting server-side cover letter upload...")

    // Check if token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("❌ [API] BLOB_READ_WRITE_TOKEN not configured")
      return NextResponse.json({ success: false, error: "Vercel Blob token not configured" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileName = formData.get("fileName") as string
    const applicationId = formData.get("applicationId") as string
    const fileType = formData.get("fileType") as string

    if (!file || !fileName || !applicationId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log(`📤 [API] Uploading cover letter: ${fileName}`)
    console.log(`📊 [API] File size: ${file.size} bytes`)
    console.log(`📁 [API] Application ID: ${applicationId}`)

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Vercel Blob
    const blob = await put(fileName, buffer, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log(`🎉 [API] Cover letter upload successful!`)
    console.log(`🔗 [API] Public URL: ${blob.url}`)

    // Store blob URL in database (not the buffer)
    try {
      await storeCoverLetterFile(applicationId, fileType as "pdf" | "docx", blob.url)
      console.log("✅ [API] Database storage successful!")
    } catch (dbError) {
      console.error("❌ [API] Database storage failed:", dbError)
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error("❌ [API] Cover letter upload failed:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
