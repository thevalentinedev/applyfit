export interface CachedSession {
  id: string
  timestamp: number
  jobUrl: string
  jobDetails: {
    jobTitle: string
    companyName: string
    location: string
    description: string
  }
  userProfile: {
    name: string
    email: string
    phone: string
    location: string
    portfolio?: string
    linkedin?: string
    github?: string
    education: string
    currentRole?: string
    experience: string
    projects: string
  }
  resume?: any
  coverLetter?: any
  useGpt4: boolean
  jdHash?: string // Add hash for duplicate detection
}

const CACHE_KEY = "applyfit_sessions"
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const MAX_SESSIONS = 10 // Keep only the 10 most recent sessions

export class CacheManager {
  // Generate hash for job description to detect duplicates
  static generateJobHash(jobDescription: string, jobTitle?: string, companyName?: string): string {
    const cleanedJD = jobDescription.trim().toLowerCase()
    const contextString = `${jobTitle || ""}_${companyName || ""}_${cleanedJD}`

    // Simple hash function (for production, consider using crypto.subtle.digest)
    let hash = 0
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  static getSessions(): CachedSession[] {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return []

      const sessions: CachedSession[] = JSON.parse(cached)

      // Filter out expired sessions
      const now = Date.now()
      const validSessions = sessions.filter((session) => now - session.timestamp < MAX_CACHE_AGE)

      // Sort by timestamp (newest first)
      return validSessions.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error("Error reading cache:", error)
      return []
    }
  }

  // Find cached session by job description hash
  static findSessionByJobHash(jobHash: string): CachedSession | null {
    const sessions = this.getSessions()
    return sessions.find((session) => session.jdHash === jobHash) || null
  }

  // Check if job description already exists in cache
  static checkForDuplicate(
    jobDescription: string,
    jobTitle?: string,
    companyName?: string,
  ): {
    isDuplicate: boolean
    cachedSession?: CachedSession
    jobHash: string
  } {
    const jobHash = this.generateJobHash(jobDescription, jobTitle, companyName)
    const cachedSession = this.findSessionByJobHash(jobHash)

    return {
      isDuplicate: !!cachedSession,
      cachedSession: cachedSession || undefined,
      jobHash,
    }
  }

  private static sanitizeForStorage(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj !== "object") {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeForStorage(item))
    }

    // Create a new object with only serializable properties
    const sanitized: any = {}

    for (const [key, value] of Object.entries(obj)) {
      // Skip React Fiber properties and DOM elements
      if (
        key.startsWith("__react") ||
        key.startsWith("_react") ||
        (value &&
          typeof value === "object" &&
          value.constructor &&
          (value.constructor.name.includes("HTML") || value.constructor.name.includes("Element")))
      ) {
        continue
      }

      try {
        // Test if the value can be stringified
        JSON.stringify(value)
        sanitized[key] = this.sanitizeForStorage(value)
      } catch (error) {
        // Skip properties that can't be serialized
        console.warn(`Skipping non-serializable property: ${key}`)
      }
    }

    return sanitized
  }

  static saveSession(session: Omit<CachedSession, "id" | "timestamp">): string {
    try {
      const sessions = this.getSessions()

      // Generate job hash if not provided
      const jdHash =
        session.jdHash ||
        this.generateJobHash(
          session.jobDetails.description,
          session.jobDetails.jobTitle,
          session.jobDetails.companyName,
        )

      const newSession: CachedSession = {
        ...this.sanitizeForStorage(session),
        id: this.generateId(),
        timestamp: Date.now(),
        jdHash,
      }

      // Add new session to the beginning
      sessions.unshift(newSession)

      // Keep only the most recent sessions
      const trimmedSessions = sessions.slice(0, MAX_SESSIONS)

      localStorage.setItem(CACHE_KEY, JSON.stringify(trimmedSessions))
      return newSession.id
    } catch (error) {
      console.error("Error saving to cache:", error)
      return ""
    }
  }

  static findSessionByJobUrl(jobUrl: string): CachedSession | null {
    const sessions = this.getSessions()
    return sessions.find((session) => session.jobUrl === jobUrl) || null
  }

  static updateSession(sessionId: string, updates: Partial<CachedSession>): void {
    try {
      const sessions = this.getSessions()
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

      if (sessionIndex !== -1) {
        const sanitizedUpdates = this.sanitizeForStorage(updates)

        // Update job hash if job details changed
        if (sanitizedUpdates.jobDetails) {
          sanitizedUpdates.jdHash = this.generateJobHash(
            sanitizedUpdates.jobDetails.description || sessions[sessionIndex].jobDetails.description,
            sanitizedUpdates.jobDetails.jobTitle || sessions[sessionIndex].jobDetails.jobTitle,
            sanitizedUpdates.jobDetails.companyName || sessions[sessionIndex].jobDetails.companyName,
          )
        }

        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          ...sanitizedUpdates,
          timestamp: Date.now(),
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(sessions))
      }
    } catch (error) {
      console.error("Error updating cache:", error)
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions()
      const filteredSessions = sessions.filter((s) => s.id !== sessionId)
      localStorage.setItem(CACHE_KEY, JSON.stringify(filteredSessions))
    } catch (error) {
      console.error("Error deleting from cache:", error)
    }
  }

  static clearAllSessions(): void {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  }

  static getSessionById(sessionId: string): CachedSession | null {
    const sessions = this.getSessions()
    return sessions.find((s) => s.id === sessionId) || null
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString()
  }

  // Get cache statistics
  static getCacheStats(): {
    totalSessions: number
    totalSize: string
    oldestSession?: string
    duplicateCount: number
  } {
    const sessions = this.getSessions()
    const cacheString = localStorage.getItem(CACHE_KEY) || ""
    const sizeInBytes = new Blob([cacheString]).size
    const sizeInKB = (sizeInBytes / 1024).toFixed(2)

    // Count potential duplicates by job hash
    const hashCounts = new Map<string, number>()
    sessions.forEach((session) => {
      if (session.jdHash) {
        hashCounts.set(session.jdHash, (hashCounts.get(session.jdHash) || 0) + 1)
      }
    })
    const duplicateCount = Array.from(hashCounts.values()).filter((count) => count > 1).length

    return {
      totalSessions: sessions.length,
      totalSize: `${sizeInKB} KB`,
      oldestSession: sessions.length > 0 ? this.formatTimestamp(sessions[sessions.length - 1].timestamp) : undefined,
      duplicateCount,
    }
  }
}
