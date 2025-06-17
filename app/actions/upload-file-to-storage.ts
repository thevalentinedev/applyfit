export async function uploadFileToStorage(
  fileBuffer: ArrayBuffer,
  filePath: string,
  contentType: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  return {
    success: false,
    error: "Supabase storage not configured. Using Vercel Blob instead.",
  }
}

export async function checkStorageBucket(): Promise<{ exists: boolean; error?: string }> {
  return {
    exists: false,
    error: "Supabase storage not configured. Using Vercel Blob instead.",
  }
}

export async function ensureStorageBucket(): Promise<{ success: boolean; error?: string }> {
  return {
    success: false,
    error: "Supabase storage not configured. Using Vercel Blob instead.",
  }
}
