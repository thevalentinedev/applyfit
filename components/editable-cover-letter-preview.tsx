"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { generateCoverLetter } from "@/app/actions/generate-cover-letter"
import { Loader2, Sparkles, Download, FileText, Edit3 } from "lucide-react"
import { exportCoverLetterToPDF, exportCoverLetterToDocx } from "@/lib/docx-export-with-blob"
import { CoverLetterRevisionPanel } from "./cover-letter-revision-panel"
import { analyzeCoverLetterForRevisions, type RevisionSuggestion } from "@/lib/cover-letter-analyzer"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface EditableCoverLetterPreviewProps {
  coverLetterContent: string
  userProfile: any
  jobDetails?: {
    title: string
    company: string
    description: string
    url?: string
    applicationId?: string
    location?: string
  }
  resumeData?: any
  onContentChange: (content: string) => void
  onBack?: () => void
  onStartOver?: () => void
}

export function EditableCoverLetterPreview({
  coverLetterContent,
  userProfile,
  jobDetails = { title: "", company: "", description: "", url: "" },
  resumeData,
  onContentChange,
  onBack,
  onStartOver,
}: EditableCoverLetterPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(coverLetterContent)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [revisionSuggestions, setRevisionSuggestions] = useState<RevisionSuggestion[]>([])
  const [isRevising, setIsRevising] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Safely access jobDetails with fallbacks
  const safeJobDetails = {
    title: jobDetails?.title || "Position",
    company: jobDetails?.company || "Company",
    description: jobDetails?.description || "",
    url: jobDetails?.url || "",
    location: jobDetails?.location || userProfile?.location || "Remote",
  }

  // Analyze cover letter for revision suggestions
  useEffect(() => {
    if (coverLetterContent && safeJobDetails.description && safeJobDetails.company !== "Company") {
      const suggestions = analyzeCoverLetterForRevisions(
        coverLetterContent,
        safeJobDetails.description,
        safeJobDetails.company,
      )
      setRevisionSuggestions(suggestions)
    }
  }, [coverLetterContent, safeJobDetails.description, safeJobDetails.company])

  // Format current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleSave = () => {
    onContentChange(editedContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(coverLetterContent)
    setIsEditing(false)
  }

  const handleRegenerateCoverLetter = async () => {
    if (!safeJobDetails.title || !safeJobDetails.company || !safeJobDetails.description) {
      alert("Missing job information. Please ensure job title, company, and description are available.")
      return
    }

    setIsRegenerating(true)
    try {
      // FIXED: Pass job location correctly to the generateCoverLetter function
      const result = await generateCoverLetter(
        safeJobDetails.title,
        safeJobDetails.company,
        safeJobDetails.description,
        resumeData || {
          summary: userProfile?.professional_summary || "",
          skills: userProfile?.skills || {},
          experience: userProfile?.professional_experience || [],
          projects: userProfile?.projects || [],
          candidateInfo: {
            name: userProfile?.full_name,
            email: userProfile?.email,
            phone: userProfile?.phone,
            location: userProfile?.location,
            website: userProfile?.website,
            linkedin: userProfile?.linkedin_url,
            github: userProfile?.github_url,
          },
        },
        false, // useGpt4
        "auto", // selectedTone
        safeJobDetails.location, // Explicitly pass job location
      )

      if (result.success) {
        // Format the regenerated cover letter
        const formattedCoverLetter = `${result.greeting}

${result.body.hook}

${result.body.skills}

${result.body.closing}

Best regards,
${userProfile?.full_name || "Your Name"}`

        setEditedContent(formattedCoverLetter)
        onContentChange(formattedCoverLetter)
      } else {
        alert(`Failed to regenerate cover letter: ${result.error}`)
      }
    } catch (error) {
      console.error("Error regenerating cover letter:", error)
      alert("An error occurred while regenerating the cover letter. Please try again.")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleReviseSection = async (section: "hook" | "skills" | "closing", suggestionId: string) => {
    if (!safeJobDetails.description) return

    setIsRevising(true)
    try {
      // For now, regenerate the entire cover letter with enhanced focus
      await handleRegenerateCoverLetter()
    } catch (error) {
      console.error("Error revising section:", error)
      alert("Failed to revise section. Please try again.")
    } finally {
      setIsRevising(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!coverLetterContent) {
      alert("Please generate or write a cover letter first.")
      return
    }

    setIsDownloading(true)
    try {
      // FIXED: Use correct job location in PDF export
      const coverLetterData = {
        candidateName: userProfile?.full_name || "Candidate Name",
        candidateEmail: userProfile?.email || "email@example.com",
        candidatePhone: userProfile?.phone || "",
        candidateWebsite: userProfile?.website || "",
        candidateLinkedIn: userProfile?.linkedin_url || "",
        candidateGitHub: userProfile?.github_url || "",
        location: safeJobDetails.location, // Use job location
        date: currentDate,
        recipient: {
          name: "Hiring Manager",
          company: safeJobDetails.company,
          location: safeJobDetails.location, // Use job location
        },
        greeting: `Dear Hiring Manager,`,
        body: {
          hook: coverLetterContent.split("\n\n")[1] || coverLetterContent.substring(0, 200),
          skills: coverLetterContent.split("\n\n")[2] || "",
          closing: coverLetterContent.split("\n\n")[3] || "",
        },
        applicationId: jobDetails?.applicationId || resumeData?.applicationId,
      }

      console.log("🎉 Starting PDF cover letter generation...")
      console.log("🔗 Cover Letter PDF - Blob URL will be logged after upload")

      const result = await exportCoverLetterToPDF(coverLetterData)

      if (result.success) {
        // No popup needed after download
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadDOCX = async () => {
    if (!coverLetterContent) {
      alert("Please generate or write a cover letter first.")
      return
    }

    setIsDownloading(true)
    try {
      // FIXED: Use correct job location in DOCX export
      const coverLetterData = {
        candidateName: userProfile?.full_name || "Candidate Name",
        candidateEmail: userProfile?.email || "email@example.com",
        candidatePhone: userProfile?.phone || "",
        candidateWebsite: userProfile?.website || "",
        candidateLinkedIn: userProfile?.linkedin_url || "",
        candidateGitHub: userProfile?.github_url || "",
        location: safeJobDetails.location, // Use job location
        date: currentDate,
        recipient: {
          name: "Hiring Manager",
          company: safeJobDetails.company,
          location: safeJobDetails.location, // Use job location
        },
        greeting: `Dear Hiring Manager,`,
        body: {
          hook: coverLetterContent.split("\n\n")[1] || coverLetterContent.substring(0, 200),
          skills: coverLetterContent.split("\n\n")[2] || "",
          closing: coverLetterContent.split("\n\n")[3] || "",
        },
        applicationId: jobDetails?.applicationId || resumeData?.applicationId,
      }

      console.log("🎉 Starting DOCX cover letter generation...")
      console.log("🔗 Cover Letter DOCX - Blob URL will be logged after upload")

      const result = await exportCoverLetterToDocx(coverLetterData)

      if (result.success) {
        // No popup needed after download
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error downloading DOCX:", error)
      alert("Failed to download DOCX. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Handler for double-click to edit
  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  // Handler for mouse enter/leave to show overlay
  const handleMouseEnter = () => setShowOverlay(true)
  const handleMouseLeave = () => setShowOverlay(false)

  return (
    <div className="space-y-6">
      {/* Action Buttons - Back, Start Over, Download (top) */}
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              ← Back
            </Button>
          )}
          {onStartOver && (
            <Button
              variant="outline"
              onClick={() => {
                if (typeof onStartOver === "function") {
                  onStartOver()
                } else {
                  router.push("/")
                }
              }}
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              Start Over
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-brand-dark text-brand-dark hover:bg-brand-light"
                disabled={isDownloading}
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading}>
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadDOCX} disabled={isDownloading}>
                DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Revision Suggestions Panel */}
      {revisionSuggestions.length > 0 && (
        <CoverLetterRevisionPanel
          suggestions={revisionSuggestions}
          onReviseSection={handleReviseSection}
          isRevising={isRevising}
        />
      )}
      {/* Main Cover Letter Preview */}
      <div className="border rounded-md p-6 shadow-md bg-white max-w-4xl mx-auto">
        {/* Overlay Edit/Regenerate Buttons */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={contentRef}
            onDoubleClick={handleDoubleClick}
            className="min-h-[350px]"
            style={{ cursor: isEditing ? 'text' : 'pointer' }}
          >
            {/* Overlay buttons (top right) */}
            {showOverlay && !isEditing && (
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Button
                  size="icon"
                  variant="outline"
                  className="shadow bg-white/80 hover:bg-brand-light border border-brand"
                  onClick={() => setIsEditing(true)}
                  title="Edit Manually"
                >
                  <Edit3 className="w-4 h-4 text-brand" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="shadow bg-white/80 hover:bg-brand-light border border-brand"
                  onClick={handleRegenerateCoverLetter}
                  title="Regenerate with AI"
                  disabled={isRegenerating || isRevising}
                >
                  {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin text-brand" /> : <Sparkles className="w-4 h-4 text-brand" />}
                </Button>
              </div>
            )}
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex gap-2 p-2 border-b items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Edit Cover Letter:</span>
                </div>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[350px] resize-none font-serif text-sm leading-relaxed"
                  placeholder="Your cover letter content will appear here..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="bg-brand hover:bg-brand-dark">
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-line font-serif text-sm leading-relaxed">
                {coverLetterContent || "No cover letter content available."}
              </div>
            )}
          </div>
        </div>
        {/* Footer signature */}
        <div className="mt-8 pt-4 border-t">
          <div className="font-serif text-sm">Best regards,</div>
          <div className="font-semibold mt-2 font-serif">{userProfile?.full_name || "Your Name"}</div>
        </div>
      </div>
    </div>
  )
}
