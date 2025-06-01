"use client"

import { useEffect, useRef, useCallback } from "react"
import { DraftManager } from "@/lib/draft-manager"

interface UseAutoSaveOptions {
  delay?: number // Debounce delay in milliseconds
  enabled?: boolean
}

export function useAutoSave<T>(data: T, saveFunction: (data: T) => void, options: UseAutoSaveOptions = {}) {
  const { delay = 2000, enabled = true } = options
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousDataRef = useRef<T>()

  const debouncedSave = useCallback(
    (dataToSave: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        saveFunction(dataToSave)
      }, delay)
    },
    [saveFunction, delay],
  )

  useEffect(() => {
    if (!enabled) return

    // Only save if data has actually changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      debouncedSave(data)
      previousDataRef.current = data
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, debouncedSave, enabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}

// Specific hooks for resume and cover letter auto-saving
export function useResumeAutoSave(
  resumeData: any,
  jobContext: { jobUrl?: string; jobTitle?: string; companyName?: string },
  enabled = true,
) {
  const saveResumeDraft = useCallback(
    (data: any) => {
      if (!data || !enabled) return

      DraftManager.saveResumeDraft({
        ...jobContext,
        summary: data.summary,
        skills: data.skills,
        experience: data.experience,
        projects: data.projects,
        userProfile: data.userProfile,
      })
    },
    [jobContext, enabled],
  )

  useAutoSave(resumeData, saveResumeDraft, { enabled })
}

export function useCoverLetterAutoSave(
  coverLetterData: any,
  jobContext: { jobUrl?: string; jobTitle?: string; companyName?: string },
  enabled = true,
) {
  const saveCoverLetterDraft = useCallback(
    (data: any) => {
      if (!data || !enabled) return

      DraftManager.saveCoverLetterDraft({
        ...jobContext,
        location: data.location,
        date: data.date,
        recipient: data.recipient,
        greeting: data.greeting,
        body: data.body,
      })
    },
    [jobContext, enabled],
  )

  useAutoSave(coverLetterData, saveCoverLetterDraft, { enabled })
}
