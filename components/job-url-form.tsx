"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, User, FileText, Link, Type, Clock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseLinkedInJob, type JobDetails } from "@/app/actions/parse-job"
import { JobDetailsPreview } from "./job-details-preview"
import { UserProfilePreview } from "./user-profile-preview"
import { generateResume, type UserProfile, type GeneratedResume } from "@/app/actions/generate-resume"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { EditableResumePreview } from "./editable-resume-preview"
import { CachedSessions } from "./cached-sessions"
import { SessionRestore } from "./session-restore"
import { CacheManager, type CachedSession } from "@/lib/cache-manager"
import { DraftManager, type ResumeDraft, type CoverLetterDraft } from "@/lib/draft-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function JobUrlForm() {
  const { toast } = useToast()
  const [jobUrl, setJobUrl] = useState("")
  const [manualJobDescription, setManualJobDescription] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [showProfilePreview, setShowProfilePreview] = useState(false)
  const [showJobPreview, setShowJobPreview] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [useGpt4, setUseGpt4] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showSessionRestore, setShowSessionRestore] = useState(false)
  const [jobAnalyzed, setJobAnalyzed] = useState(false)
  const [duplicateCheck, setDuplicateCheck] = useState<{
    isDuplicate: boolean
    cachedSession?: CachedSession
    jobHash: string
  } | null>(null)

  const [currentStep, setCurrentStep] = useState<"input" | "generating" | "preview">("input")
  const [userProfile] = useState<UserProfile>({
    name: "Valentine Ohalebo",
    email: "hello@valentine.dev",
    phone: "+1 647 282 8563",
    location: "Waterloo, ON",
    portfolio: "https://valentine.dev",
    linkedin: "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
    github: "https://github.com/thevalentinedev",
    education: "Ontario College Diploma, Computer Programming - 2025, Conestoga College - Waterloo, ON",
    currentRole: "Full-Stack Developer & Creator",
    experience: `GeoEvent (Jan 2024 - Present) - Remote
• Developed and maintained event management platform using React, Next.js, and Node.js
• Implemented real-time features and optimized database performance
• Collaborated with cross-functional teams to deliver user-centric solutions

Naija Jollof (Feb 2024 - May 2025) - Remote  
• Built responsive web application for Nigerian food delivery service
• Focused on SEO optimization and accessibility improvements
• Enhanced user experience through modern UI/UX design principles`,
    projects: `ImageMark - Creator & Developer
• Developed watermarking application with 10k+ operations processed
• Implemented smart positioning algorithms using Canvas API
• Built with React, TypeScript, and modern web technologies

GeoEvent Platform (geoevent.ca)
• Full-stack event management solution
• Real-time updates and interactive features
• Modern tech stack with focus on performance

Naija Jollof Website (naijajollofw.ca)
• E-commerce platform for food delivery
• SEO-optimized with accessibility features
• Responsive design for mobile and desktop`,
  })
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null)
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)

  useEffect(() => {
    // Check for drafts on component mount
    const hasDrafts = DraftManager.hasDrafts()
    if (hasDrafts) {
      setShowSessionRestore(true)
    }

    // Load any existing sessions on component mount
    const sessions = CacheManager.getSessions()
    if (sessions.length > 0) {
      // Auto-populate the most recent job URL if available
      const mostRecent = sessions[0]
      if (mostRecent.jobUrl && !jobUrl) {
        setJobUrl(mostRecent.jobUrl)
      }
    }
  }, [])

  // Check for duplicates when job details change
  useEffect(() => {
    if (jobDetails && jobDetails.success) {
      const duplicateResult = CacheManager.checkForDuplicate(
        jobDetails.description,
        jobDetails.jobTitle,
        jobDetails.companyName,
      )
      setDuplicateCheck(duplicateResult)
    }
  }, [jobDetails])

  const validateLinkedInUrl = (url: string) => {
    return url.startsWith("https://www.linkedin.com/jobs/view/")
  }

  const handleRestoreResumeDraft = (draft: ResumeDraft) => {
    if (draft.jobUrl) setJobUrl(draft.jobUrl)

    if (draft.summary || draft.skills || draft.experience || draft.projects) {
      const restoredResume: GeneratedResume = {
        jobTitle: draft.jobTitle || "",
        location: "",
        summary: draft.summary || "",
        skills: draft.skills || {
          Languages: [],
          Frameworks: [],
          "Tools & Platforms": [],
          Practices: [],
        },
        experience: draft.experience || [],
        projects: draft.projects || [],
        success: true,
      }
      setGeneratedResume(restoredResume)

      // Set up job details if available
      if (draft.jobTitle && draft.companyName) {
        setJobDetails({
          jobTitle: draft.jobTitle,
          companyName: draft.companyName,
          location: "",
          description: "",
          success: true,
        })
        setJobAnalyzed(true)
      }

      setCurrentStep("preview")
    }
  }

  const handleRestoreCoverLetterDraft = (draft: CoverLetterDraft) => {
    if (draft.jobUrl) setJobUrl(draft.jobUrl)
  }

  const handleLoadSession = (session: CachedSession) => {
    setJobUrl(session.jobUrl)
    setJobDetails({
      ...session.jobDetails,
      success: true,
    })
    setUseGpt4(session.useGpt4)
    setCurrentSessionId(session.id)
    setJobAnalyzed(true)

    if (session.resume) {
      setGeneratedResume(session.resume)
      setCurrentStep("preview")
    }

    DraftManager.clearAllDrafts()

    toast({
      title: "Session loaded",
      description: `Loaded your previous work for ${session.jobDetails.companyName}.`,
      variant: "success",
    })
  }

  const handleLoadCachedSession = (cachedSession: CachedSession) => {
    handleLoadSession(cachedSession)
    setDuplicateCheck(null) // Clear duplicate check after loading
  }

  const handleClearCache = () => {
    setCurrentSessionId(null)
  }

  const saveCurrentSession = () => {
    if (!jobDetails || !userProfile) return

    const sessionData = {
      jobUrl,
      jobDetails: {
        jobTitle: jobDetails.jobTitle,
        companyName: jobDetails.companyName,
        location: jobDetails.location,
        description: jobDetails.description,
      },
      userProfile,
      resume: generatedResume,
      useGpt4,
      jdHash: duplicateCheck?.jobHash,
    }

    if (currentSessionId) {
      CacheManager.updateSession(currentSessionId, sessionData)
    } else {
      const newSessionId = CacheManager.saveSession(sessionData)
      setCurrentSessionId(newSessionId)
    }
  }

  const handleManualJobSubmit = () => {
    if (!manualJobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter the job description.",
        variant: "destructive",
      })
      return
    }

    // Create job details from manual input
    const details: JobDetails = {
      jobTitle: "Software Developer", // Default title, user can edit
      companyName: "Company Name", // Default company, user can edit
      location: "Remote", // Default location, user can edit
      description: manualJobDescription,
      success: true,
    }

    setJobDetails(details)
    setShowManualInput(false)
    setJobAnalyzed(true)

    toast({
      title: "Job description processed",
      description: "Job details have been extracted. You can now generate your tailored resume.",
      variant: "success",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsValidating(true)

    // Check if we have a cached session for this URL
    const cachedSession = CacheManager.findSessionByJobUrl(jobUrl)
    if (cachedSession) {
      setValidationResult({
        isValid: true,
        message: "Found previous work for this job. Check the session below to load it.",
      })
      setIsValidating(false)
      return
    }

    // Validate URL format
    const isValid = validateLinkedInUrl(jobUrl)

    setValidationResult({
      isValid,
      message: isValid ? "Valid job post link. Extracting details..." : "Please enter a valid LinkedIn job post URL.",
    })

    setIsValidating(false)

    // If URL is valid, try to parse the job details
    if (isValid) {
      setIsParsing(true)
      try {
        const details = await parseLinkedInJob(jobUrl)

        // Validate the response
        if (!details) {
          throw new Error("No response received from job parser")
        }

        setJobDetails(details)

        if (!details.success) {
          toast({
            title: "Couldn't extract job details",
            description: details.error || "LinkedIn may be blocking our request. Please try manual input.",
            variant: "destructive",
          })
        } else {
          setJobAnalyzed(true)
          toast({
            title: "Job details extracted",
            description: "Job information has been successfully extracted. You can now generate your tailored resume.",
            variant: "success",
          })
        }
      } catch (error) {
        console.error("Error parsing job:", error)

        // Create a fallback error response
        const errorDetails: JobDetails = {
          jobTitle: "",
          companyName: "",
          location: "",
          description: "",
          success: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred while parsing the job details.",
        }

        setJobDetails(errorDetails)

        toast({
          title: "Error extracting job details",
          description: "An unexpected error occurred. Please try manual input instead.",
          variant: "destructive",
        })
      } finally {
        setIsParsing(false)
      }
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid LinkedIn job post URL.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateResume = async (forceRegenerate = false) => {
    if (!jobDetails) return

    // Check if we should use cached version
    if (duplicateCheck?.isDuplicate && !forceRegenerate && duplicateCheck.cachedSession?.resume) {
      setGeneratedResume(duplicateCheck.cachedSession.resume)
      setCurrentStep("preview")
      setCurrentSessionId(duplicateCheck.cachedSession.id)

      toast({
        title: "Loaded cached resume",
        description: "Using your previous resume for this job description.",
        variant: "success",
      })
      return
    }

    setIsGeneratingResume(true)
    setCurrentStep("generating")

    try {
      const resume = await generateResume(
        jobDetails.jobTitle,
        jobDetails.companyName,
        jobDetails.description,
        userProfile,
        useGpt4,
      )

      if (resume.success) {
        // Ensure location is properly set from job details
        const updatedResume = {
          ...resume,
          location: jobDetails.location || "Remote",
        }

        setGeneratedResume(updatedResume)
        setCurrentStep("preview")

        saveCurrentSession()
        DraftManager.clearResumeDraft()

        toast({
          title: "Resume generated successfully",
          description: `Your tailored resume is ready using ${useGpt4 ? "GPT-4" : "GPT-3.5"}.`,
          variant: "success",
        })
      } else {
        setCurrentStep("input")
        toast({
          title: "Resume generation failed",
          description: resume.error || "Failed to generate resume. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating resume:", error)
      setCurrentStep("input")
      toast({
        title: "Resume generation failed",
        description: "An unexpected error occurred. Please try again in a few moments.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingResume(false)
    }
  }

  const handleResumeUpdate = (updatedResume: GeneratedResume) => {
    setGeneratedResume(updatedResume)
    saveCurrentSession()
  }

  const handleJobDetailsUpdate = (updatedDetails: JobDetails) => {
    setJobDetails(updatedDetails)
  }

  const handleBackToInput = () => {
    setCurrentStep("input")
    setShowJobPreview(false)
    setShowProfilePreview(false)
  }

  const handleStartOver = () => {
    // Clear all state
    setJobUrl("")
    setManualJobDescription("")
    setShowManualInput(false)
    setValidationResult(null)
    setJobDetails(null)
    setJobAnalyzed(false)
    setGeneratedResume(null)
    setCurrentStep("input")
    setDuplicateCheck(null)

    // Clear current session
    if (currentSessionId) {
      CacheManager.deleteSession(currentSessionId)
      setCurrentSessionId(null)
    }

    // Clear drafts
    DraftManager.clearAllDrafts()

    toast({
      title: "Session cleared",
      description: "Starting fresh with a new job application.",
      variant: "success",
    })
  }

  // Render different content based on the current step
  if (currentStep === "generating") {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">Generating Your Resume</h3>
          <p className="text-gray-600">
            Analyzing job requirements and tailoring your resume using {useGpt4 ? "GPT-4" : "GPT-3.5"}...
          </p>
          <div className="text-sm text-gray-500">This may take 10-30 seconds</div>
        </div>
      </div>
    )
  }

  if (currentStep === "preview" && generatedResume && jobDetails) {
    return (
      <EditableResumePreview
        resume={generatedResume}
        onPreviewResume={() => {}} // Not needed in this flow
        jobTitle={jobDetails.jobTitle}
        companyName={jobDetails.companyName}
        jobDescription={jobDetails.description}
        useGpt4={useGpt4}
        userProfile={{
          summary: userProfile?.experience || "",
          skills: {},
          experience: userProfile?.experience || "",
          projects: userProfile?.projects || "",
        }}
        onResumeUpdate={handleResumeUpdate}
        onBack={handleBackToInput}
        onStartOver={handleStartOver}
        showFullPreview={true}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Restore Modal */}
      {showSessionRestore && (
        <SessionRestore
          onRestoreResume={handleRestoreResumeDraft}
          onRestoreCoverLetter={handleRestoreCoverLetterDraft}
          onDismiss={() => setShowSessionRestore(false)}
        />
      )}

      {/* Duplicate Detection Alert */}
      {duplicateCheck?.isDuplicate && duplicateCheck.cachedSession && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Similar job found!</strong> You already have a resume for this job description from{" "}
                {CacheManager.formatTimestamp(duplicateCheck.cachedSession.timestamp)}.
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadCachedSession(duplicateCheck.cachedSession!)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Load Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDuplicateCheck(null)} className="text-gray-600">
                  Create New
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowProfilePreview(true)}
            className="flex items-center gap-2 justify-center sm:justify-start"
          >
            <User className="h-4 w-4" />
            View Profile
          </Button>
          {jobDetails && (
            <Button
              variant="outline"
              onClick={() => setShowJobPreview(true)}
              className="flex items-center gap-2 justify-center sm:justify-start"
            >
              <FileText className="h-4 w-4" />
              Job Preview
            </Button>
          )}
        </div>

        {/* GPT-4 Toggle */}
        <div className="flex items-center space-x-2">
          <Switch id="use-gpt4" checked={useGpt4} onCheckedChange={setUseGpt4} />
          <Label htmlFor="use-gpt4" className="text-sm text-gray-600">
            Use GPT-4 (Higher Quality)
          </Label>
        </div>
      </div>

      {/* Cached Sessions */}
      <CachedSessions currentJobUrl={jobUrl} onLoadSession={handleLoadSession} onClearCache={handleClearCache} />

      {/* Main Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showManualInput ? (
            // URL Input
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="job-url" className="block text-sm font-medium text-gray-700">
                  LinkedIn Job URL
                </label>
                <Input
                  id="job-url"
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  className="w-full"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  required
                  disabled={isParsing}
                />
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Paste manually
                </button>
              </div>

              {validationResult && (
                <div
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    validationResult.isValid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
                  )}
                >
                  {validationResult.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm">{validationResult.message}</span>
                </div>
              )}

              {/* Show Analyze Job button only if job hasn't been analyzed */}
              {!jobAnalyzed && (
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isValidating || isParsing || !jobUrl}
                >
                  {isParsing ? "Extracting Job Details..." : isValidating ? "Analyzing..." : "Analyze Job"}
                </Button>
              )}
            </form>
          ) : (
            // Manual Input
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="manual-job" className="block text-sm font-medium text-gray-700">
                  <Type className="h-4 w-4 inline mr-2" />
                  Job Description
                </label>
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Use LinkedIn URL instead
                </button>
              </div>
              <Textarea
                id="manual-job"
                placeholder="Paste the complete job description here..."
                className="min-h-[200px] resize-none"
                value={manualJobDescription}
                onChange={(e) => setManualJobDescription(e.target.value)}
              />
              {/* Show Process Job Description button only if job hasn't been analyzed */}
              {!jobAnalyzed && (
                <Button
                  onClick={handleManualJobSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!manualJobDescription.trim()}
                >
                  Process Job Description
                </Button>
              )}
            </div>
          )}

          {/* Generate Resume Button - Show only after job has been analyzed */}
          {jobAnalyzed && jobDetails && jobDetails.success && (
            <div className="pt-4 border-t">
              <div className="space-y-3">
                <Button
                  onClick={() => handleGenerateResume(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  disabled={isGeneratingResume}
                >
                  {isGeneratingResume
                    ? "Generating Resume..."
                    : duplicateCheck?.isDuplicate
                      ? "Load Cached Resume"
                      : "Generate Tailored Resume"}
                </Button>

                {/* Force regenerate option for duplicates */}
                {duplicateCheck?.isDuplicate && (
                  <Button
                    onClick={() => handleGenerateResume(true)}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    disabled={isGeneratingResume}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Force New Generation
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Preview Modal */}
      {showProfilePreview && (
        <UserProfilePreview userProfile={userProfile} onClose={() => setShowProfilePreview(false)} />
      )}

      {/* Job Preview Modal */}
      {showJobPreview && jobDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Job Preview</h3>
                <Button variant="ghost" onClick={() => setShowJobPreview(false)}>
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <JobDetailsPreview
                jobDetails={jobDetails}
                isExpanded={true}
                onToggleExpand={() => {}}
                onUpdateJobDetails={handleJobDetailsUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
