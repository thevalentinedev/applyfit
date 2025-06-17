"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, FileText, Link, Type, Clock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseLinkedInJob, type JobDetails } from "@/app/actions/parse-job"
import { JobDetailsPreview } from "./job-details-preview"
import { UserProfilePreview } from "./user-profile-preview"
import { generateResume, type GeneratedResume } from "@/app/actions/generate-resume"
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

interface JobUrlFormProps {
  userProfile: any // User profile from database
}

export function JobUrlForm({ userProfile }: JobUrlFormProps) {
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
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null)
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)

  const checkProfileCompletion = () => {
    if (!userProfile) {
      return false
    }

    // Check for name
    const hasName = userProfile.full_name && userProfile.full_name.trim().length > 0

    // Check for experience
    const hasExperience =
      userProfile.professional_experience &&
      Array.isArray(userProfile.professional_experience) &&
      userProfile.professional_experience.length > 0

    // Check for education
    const hasEducation =
      userProfile.education && Array.isArray(userProfile.education) && userProfile.education.length > 0

    // Check for projects
    const hasProjects =
      userProfile.projects_achievements &&
      Array.isArray(userProfile.projects_achievements) &&
      userProfile.projects_achievements.length > 0

    // Check for bio/summary as additional content
    const hasBio = userProfile.bio && userProfile.bio.trim().length > 0

    const isComplete = hasName && (hasExperience || hasEducation || hasProjects || hasBio)

    return isComplete
  }

  const isProfileComplete = checkProfileCompletion()

  // Get missing profile elements for better user guidance
  const getMissingProfileElements = () => {
    if (!userProfile) return ["Please sign in and create your profile"]

    const missing = []

    if (!userProfile.full_name || userProfile.full_name.trim().length === 0) {
      missing.push("Full name")
    }

    const hasAnyContent =
      (userProfile.professional_experience &&
        Array.isArray(userProfile.professional_experience) &&
        userProfile.professional_experience.length > 0) ||
      (userProfile.education && Array.isArray(userProfile.education) && userProfile.education.length > 0) ||
      (userProfile.projects_achievements &&
        Array.isArray(userProfile.projects_achievements) &&
        userProfile.projects_achievements.length > 0) ||
      (userProfile.bio && userProfile.bio.trim().length > 0)

    if (!hasAnyContent) {
      missing.push("At least one of: professional experience, education, projects, or bio")
    }

    return missing
  }

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
    return url.startsWith("https://www.linkedin.com/jobs/view/") || url.includes("linkedin.com/jobs")
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
      message: isValid ? "Valid job post link. Extracting details..." : "Please enter a valid job posting URL.",
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
            description: details.error || "The site may be blocking our request. Please try manual input.",
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
        description: "Please enter a valid job posting URL.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateResume = async (forceRegenerate = false) => {
    if (!jobDetails) return

    // Check if user is signed in
    if (!userProfile) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate a personalized resume.",
        variant: "destructive",
      })
      // Redirect to login
      window.location.href = "/auth/login"
      return
    }

    // Check if profile is complete enough
    if (!isProfileComplete) {
      const missingElements = getMissingProfileElements()
      toast({
        title: "Profile incomplete",
        description: `Please add the following to your profile: ${missingElements.join(", ")}`,
        variant: "destructive",
      })
      return
    }

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
        useGpt4,
        jobUrl,
      )

      if (resume.success) {
        // Ensure location is properly set from job details or user profile
        const updatedResume = {
          ...resume,
          location: jobDetails.location || userProfile?.location || "Remote",
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
        userProfile={userProfile} // Pass the actual user profile
        onResumeUpdate={handleResumeUpdate}
        onBack={handleBackToInput}
        onStartOver={handleStartOver}
        showFullPreview={true}
      />
    )
  }

  const missingElements = getMissingProfileElements()

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

      {/* Profile Completion Warning */}
      {!userProfile ? (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Sign in required!</strong> You need to sign in and create a profile to generate personalized
                resumes.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/auth/login")}
                className="text-blue-600 border-blue-300 hover:bg-blue-100 ml-4"
              >
                Sign In
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : !isProfileComplete ? (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Profile incomplete!</strong> Missing: {missingElements.join(", ")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/dashboard/profile", "_blank")}
                className="text-amber-600 border-amber-300 hover:bg-amber-100 ml-4"
              >
                Complete Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

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
                  Job Posting URL
                </label>
                <Input
                  id="job-url"
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/... or any job posting URL"
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
                  Paste manually instead
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
                  Use job URL instead
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
                  disabled={isGeneratingResume || !userProfile}
                >
                  {!userProfile
                    ? "Sign In to Generate Resume"
                    : isGeneratingResume
                      ? "Generating Resume..."
                      : duplicateCheck?.isDuplicate
                        ? "Load Cached Resume"
                        : "Generate Tailored Resume"}
                </Button>

                {/* Force regenerate option for duplicates */}
                {duplicateCheck?.isDuplicate && userProfile && (
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
      {showProfilePreview && userProfile && (
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
