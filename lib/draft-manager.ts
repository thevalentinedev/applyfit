export interface ResumeDraft {
  id: string
  timestamp: number
  jobUrl?: string
  jobTitle?: string
  companyName?: string
  summary?: string
  skills?: { [category: string]: string[] }
  experience?: Array<{
    title: string
    period: string
    bullets: string[]
  }>
  projects?: Array<{
    title: string
    period: string
    bullets: string[]
  }>
  userProfile?: any
}

export interface CoverLetterDraft {
  id: string
  timestamp: number
  jobUrl?: string
  jobTitle?: string
  companyName?: string
  location?: string
  date?: string
  recipient?: {
    name: string
    company: string
    location: string
  }
  greeting?: string
  body?: {
    hook: string
    skills: string
    closing: string
  }
}

const RESUME_DRAFT_KEY = "applyfit_resume_draft"
const COVER_DRAFT_KEY = "applyfit_cover_draft"
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export class DraftManager {
  // Resume Draft Management
  static saveResumeDraft(draft: Omit<ResumeDraft, "id" | "timestamp">): void {
    try {
      const draftData: ResumeDraft = {
        ...draft,
        id: this.generateId(),
        timestamp: Date.now(),
      }
      localStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify(draftData))
    } catch (error) {
      console.error("Error saving resume draft:", error)
    }
  }

  static getResumeDraft(): ResumeDraft | null {
    try {
      const stored = localStorage.getItem(RESUME_DRAFT_KEY)
      if (!stored) return null

      const draft: ResumeDraft = JSON.parse(stored)

      // Check if draft is expired
      if (Date.now() - draft.timestamp > DRAFT_EXPIRY) {
        this.clearResumeDraft()
        return null
      }

      return draft
    } catch (error) {
      console.error("Error reading resume draft:", error)
      return null
    }
  }

  static clearResumeDraft(): void {
    try {
      localStorage.removeItem(RESUME_DRAFT_KEY)
    } catch (error) {
      console.error("Error clearing resume draft:", error)
    }
  }

  // Cover Letter Draft Management
  static saveCoverLetterDraft(draft: Omit<CoverLetterDraft, "id" | "timestamp">): void {
    try {
      const draftData: CoverLetterDraft = {
        ...draft,
        id: this.generateId(),
        timestamp: Date.now(),
      }
      localStorage.setItem(COVER_DRAFT_KEY, JSON.stringify(draftData))
    } catch (error) {
      console.error("Error saving cover letter draft:", error)
    }
  }

  static getCoverLetterDraft(): CoverLetterDraft | null {
    try {
      const stored = localStorage.getItem(COVER_DRAFT_KEY)
      if (!stored) return null

      const draft: CoverLetterDraft = JSON.parse(stored)

      // Check if draft is expired
      if (Date.now() - draft.timestamp > DRAFT_EXPIRY) {
        this.clearCoverLetterDraft()
        return null
      }

      return draft
    } catch (error) {
      console.error("Error reading cover letter draft:", error)
      return null
    }
  }

  static clearCoverLetterDraft(): void {
    try {
      localStorage.removeItem(COVER_DRAFT_KEY)
    } catch (error) {
      console.error("Error clearing cover letter draft:", error)
    }
  }

  // Utility methods
  static hasDrafts(): boolean {
    return this.getResumeDraft() !== null || this.getCoverLetterDraft() !== null
  }

  static clearAllDrafts(): void {
    this.clearResumeDraft()
    this.clearCoverLetterDraft()
  }

  static formatDraftAge(timestamp: number): string {
    const now = Date.now()
    const diffMs = now - timestamp
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

    return new Date(timestamp).toLocaleDateString()
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}
