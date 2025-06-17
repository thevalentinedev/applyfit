// Note: This file now only contains utility functions for file path generation
// All actual storage operations use Vercel Blob via the blob storage helpers

// Helper function to generate file paths
export function generateFilePath(userId: string, applicationId: string, fileName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const extension = fileName.split(".").pop()
  return `${userId}/${applicationId}/${fileName.replace(/\.[^/.]+$/, "")}_${timestamp}.${extension}`
}

// Legacy storage helper classes removed - use Vercel Blob instead
export class StorageHelper {
  constructor() {
    console.warn("StorageHelper is deprecated. Use Vercel Blob storage instead.")
  }
}

export class ServerStorageHelper {
  constructor() {
    console.warn("ServerStorageHelper is deprecated. Use Vercel Blob storage instead.")
  }
}
