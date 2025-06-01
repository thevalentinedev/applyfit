"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, FileText, Mail, X } from "lucide-react"
import { DraftManager, type ResumeDraft, type CoverLetterDraft } from "@/lib/draft-manager"
import { useToast } from "@/hooks/use-toast"

interface SessionRestoreProps {
  onRestoreResume?: (draft: ResumeDraft) => void
  onRestoreCoverLetter?: (draft: CoverLetterDraft) => void
  onDismiss: () => void
}

export function SessionRestore({ onRestoreResume, onRestoreCoverLetter, onDismiss }: SessionRestoreProps) {
  const [resumeDraft, setResumeDraft] = useState<ResumeDraft | null>(null)
  const [coverDraft, setCoverDraft] = useState<CoverLetterDraft | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const resume = DraftManager.getResumeDraft()
    const cover = DraftManager.getCoverLetterDraft()

    if (resume || cover) {
      setResumeDraft(resume)
      setCoverDraft(cover)
      setIsVisible(true)
    }
  }, [])

  const handleRestoreResume = () => {
    if (resumeDraft && onRestoreResume) {
      onRestoreResume(resumeDraft)
      toast({
        title: "Resume draft restored",
        description: "Your previous edits have been restored.",
        variant: "success",
      })
    }
  }

  const handleRestoreCoverLetter = () => {
    if (coverDraft && onRestoreCoverLetter) {
      onRestoreCoverLetter(coverDraft)
      toast({
        title: "Cover letter draft restored",
        description: "Your previous edits have been restored.",
        variant: "success",
      })
    }
  }

  const handleRestoreAll = () => {
    handleRestoreResume()
    handleRestoreCoverLetter()
    setIsVisible(false)
    onDismiss()
  }

  const handleStartFresh = () => {
    DraftManager.clearAllDrafts()
    setIsVisible(false)
    onDismiss()
    toast({
      title: "Drafts cleared",
      description: "Starting with a fresh session.",
      variant: "success",
    })
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  if (!isVisible || (!resumeDraft && !coverDraft)) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Unsaved Work Found</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-orange-600">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-700 text-sm">
            We found unsaved edits from your previous session. Would you like to restore them or start fresh?
          </p>

          {/* Draft Details */}
          <div className="space-y-2">
            {resumeDraft && (
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-orange-200">
                <FileText className="h-4 w-4 text-orange-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-orange-800">Resume Draft</div>
                  <div className="text-xs text-orange-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {DraftManager.formatDraftAge(resumeDraft.timestamp)}
                    {resumeDraft.jobTitle && ` • ${resumeDraft.jobTitle}`}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreResume}
                  className="text-orange-600 border-orange-300 hover:bg-orange-100"
                >
                  Restore
                </Button>
              </div>
            )}

            {coverDraft && (
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-orange-200">
                <Mail className="h-4 w-4 text-orange-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-orange-800">Cover Letter Draft</div>
                  <div className="text-xs text-orange-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {DraftManager.formatDraftAge(coverDraft.timestamp)}
                    {coverDraft.companyName && ` • ${coverDraft.companyName}`}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreCoverLetter}
                  className="text-orange-600 border-orange-300 hover:bg-orange-100"
                >
                  Restore
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleRestoreAll} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
              Restore All
            </Button>
            <Button onClick={handleStartFresh} variant="outline" className="flex-1 border-orange-300 text-orange-700">
              Start Fresh
            </Button>
          </div>

          <p className="text-xs text-orange-600 text-center">
            Drafts are automatically saved as you work and expire after 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
