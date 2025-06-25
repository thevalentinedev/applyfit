"use client"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Loader2, Mail, FileText, ChevronDown, RotateCcw } from "lucide-react"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { UserProfile } from "@/app/actions/generate-resume"
import type { JobDetails } from "@/app/actions/parse-job"
import { exportResumeToDocx, exportResumeToPDF } from "@/lib/docx-export-with-blob"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface ResumeFullPreviewProps {
  resume: GeneratedResume
  userProfile: UserProfile
  jobDetails: JobDetails
  onBack: () => void
  onGenerateCoverLetter?: () => void
  isGeneratingCoverLetter?: boolean
  onStartOver?: () => void
}

// Helper function to safely get array from user profile data
const safeGetArray = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data
  }
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// Helper function to safely get user profile data
const safeGetUserData = (userProfile: any, field: string, fallback = "") => {
  return userProfile?.[field] || fallback
}

// Helper function to format URL
const formatUrl = (url: string) => {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}

// Helper function to extract domain from website URL
const getWebsiteDomain = (website: string): string => {
  if (!website) return "Website"
  
  try {
    // Add protocol if missing
    const url = website.startsWith("http") ? website : `https://${website}`
    const domain = new URL(url).hostname.replace("www.", "")
    return domain
  } catch {
    // If URL parsing fails, try to extract domain manually
    const cleanUrl = website.replace(/^https?:\/\//, "").replace(/^www\./, "")
    return cleanUrl || "Website"
  }
}

// Helper function to format phone number
const formatPhoneNumber = (phone: string) => {
  if (!phone) return ""
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  // Format as XXX XXX XXXX
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone // Return original if not 10 digits
}

// Helper to format month-year
const formatMonthYear = (date: string) => {
  if (!date) return ""
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  return d.toLocaleString("default", { month: "short", year: "numeric" })
}

export function ResumeFullPreview({
  resume,
  userProfile,
  jobDetails,
  onBack,
  onGenerateCoverLetter,
  isGeneratingCoverLetter = false,
  onStartOver,
}: ResumeFullPreviewProps) {
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [storedFiles, setStoredFiles] = useState<{
    resumeUrl?: string
    coverLetterUrl?: string
  }>({})

  // Safely extract user data with fallbacks - CRITICAL: Use actual user profile data
  const userName = safeGetUserData(userProfile, "full_name", safeGetUserData(userProfile, "name", "Your Name"))
  const userEmail = safeGetUserData(userProfile, "email", "your.email@example.com")
  const userPhone = safeGetUserData(userProfile, "phone", "")
  const userWebsite = safeGetUserData(userProfile, "website", safeGetUserData(userProfile, "portfolio", ""))
  const userLinkedIn = safeGetUserData(userProfile, "linkedin_url", "")
  const userGitHub = safeGetUserData(userProfile, "github_url", "")
  const userLocation = safeGetUserData(userProfile, "location", resume.location || "Your Location")

  // Safely extract arrays
  const educationArray = safeGetArray(userProfile?.education)
  const experienceArray = safeGetArray(userProfile?.professional_experience)

  // Check for stored files
  const checkStoredFiles = async () => {
    if (!resume.applicationId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("job_applications")
        .select("resume_file_url, cover_letter_file_url")
        .eq("id", resume.applicationId)
        .single()

      if (error) {
        console.error("Error checking stored files:", error)
        return
      }

      setStoredFiles({
        resumeUrl: data?.resume_file_url,
        coverLetterUrl: data?.cover_letter_file_url,
      })
    } catch (error) {
      console.error("Error checking stored files:", error)
    }
  }

  // Check for stored files on component mount
  useEffect(() => {
    checkStoredFiles()
  }, [resume.applicationId])

  const handleDownloadDOCX = async () => {
    setIsExporting(true)
    try {
      console.log("🔍 Debug - Resume object:", resume)
      console.log("🔍 Debug - Application ID:", resume.applicationId)

      // Create complete resume object with all user data mapped
      const completeResume = {
        ...resume,
        candidateName: userName,
        candidateEmail: userEmail,
        candidatePhone: userPhone,
        candidateWebsite: userWebsite,
        candidateLinkedIn: userLinkedIn,
        candidateGitHub: userGitHub,
        candidateEducation: educationArray,
        location: userLocation,
      }

      console.log("🔍 Debug - Complete resume applicationId:", completeResume.applicationId)

      const result = await exportResumeToDocx(completeResume)

      if (result.success) {
        toast({
          title: "Resume downloaded",
          description: result.url ? "Resume saved to cloud and downloaded locally" : "Resume downloaded locally",
          variant: "default",
        })

        // Refresh stored files
        setTimeout(checkStoredFiles, 1000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error generating DOCX:", error)
      toast({
        title: "Download failed",
        description: "Failed to generate DOCX file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsExporting(true)
    try {
      console.log("🔍 Debug - Resume object:", resume)
      console.log("🔍 Debug - Application ID:", resume.applicationId)

      // Create complete resume object with all user data mapped
      const completeResume = {
        ...resume,
        candidateName: userName,
        candidateEmail: userEmail,
        candidatePhone: userPhone,
        candidateWebsite: userWebsite,
        candidateLinkedIn: userLinkedIn,
        candidateGitHub: userGitHub,
        candidateEducation: educationArray,
        location: userLocation,
      }

      console.log("🔍 Debug - Complete resume applicationId:", completeResume.applicationId)

      const result = await exportResumeToPDF(completeResume)

      if (result.success) {
        toast({
          title: "Resume downloaded",
          description: result.url ? "Resume saved to cloud and downloaded locally" : "Resume downloaded locally",
          variant: "default",
        })

        // Refresh stored files
        setTimeout(checkStoredFiles, 1000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Download failed",
        description: "Failed to generate PDF file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadStoredFile = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
        <p className="text-gray-600">Review your final resume and download</p>
      </div>

      {/* Storage Status Panel */}
      {(storedFiles.resumeUrl || storedFiles.coverLetterUrl) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">☁️ Stored Files</h4>
          <div className="flex gap-2">
            {storedFiles.resumeUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadStoredFile(storedFiles.resumeUrl!, `${userName}_Resume.pdf`)}
                className="text-blue-700 border-blue-300"
              >
                <Download className="h-4 w-4 mr-1" />
                Stored Resume
              </Button>
            )}
            {storedFiles.coverLetterUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadStoredFile(storedFiles.coverLetterUrl!, `${userName}_Cover_Letter.pdf`)}
                className="text-blue-700 border-blue-300"
              >
                <Download className="h-4 w-4 mr-1" />
                Stored Cover Letter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tool Panel */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {onStartOver && (
            <Button
              variant="outline"
              onClick={onStartOver}
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Generate New File Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={isExporting}
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Download className="h-4 w-4 text-white" />}
                Download
                <ChevronDown className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadDOCX} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                DOCX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Resume Preview Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Final Resume - Dynamic User Data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1">
          <div className="bg-white rounded-lg max-h-[800px] overflow-y-auto flex justify-center items-start p-2">
            {/* Resume Content */}
            <div
              ref={resumeRef}
              className="bg-white font-sans mx-auto w-full"
              style={{
                width: "100%",
                maxWidth: "calc(100vw - 120px)", // Maximize width within viewport
                minHeight: "11in",
                fontFamily: "Arial, sans-serif",
                fontSize: "11pt",
                lineHeight: "1.15",
                boxSizing: "border-box",
                padding: "0.75in",
                margin: "0 auto",
                position: "relative",
              }}
            >
              {/* Header - CRITICAL: Using dynamic user profile data */}
              <div className="text-center mb-6">
                <h1
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontSize: "16pt", fontFamily: "Arial, sans-serif" }}
                >
                  {userName} - {resume.jobTitle}
                </h1>
                <div
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                >
                  {userLocation}
                  {userEmail && (
                    <>
                      {" • "}
                      <a
                        href={`mailto:${userEmail}`}
                        className="text-blue-600 hover:underline"
                        style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                      >
                        {userEmail}
                      </a>
                    </>
                  )}
                  {userPhone && (
                    <>
                      {" • "}
                      <span
                        className="text-gray-600"
                        style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                      >
                        {formatPhoneNumber(userPhone)}
                      </span>
                    </>
                  )}
                </div>
                {userWebsite && (
                  <div
                    className="text-sm text-gray-600 mt-1"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    <a
                      href={formatUrl(userWebsite)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                    >
                      {getWebsiteDomain(userWebsite)}
                    </a>
                  </div>
                )}
                {(userLinkedIn || userGitHub) && (
                  <div
                    className="text-sm text-gray-600 mt-1"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    {userLinkedIn && (
                      <a
                        href={formatUrl(userLinkedIn)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                      >
                        LinkedIn
                      </a>
                    )}
                    {userLinkedIn && userGitHub && " | "}
                    {userGitHub && (
                      <a
                        href={formatUrl(userGitHub)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2"
                  style={{ fontSize: "14pt", fontFamily: "Arial, sans-serif" }}
                >
                  PROFESSIONAL SUMMARY
                </h2>
                <p
                  className="text-sm text-gray-800 leading-relaxed"
                  style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                >
                  {resume.summary}
                </p>
              </div>

              {/* Technical Skills */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2"
                  style={{ fontSize: "14pt", fontFamily: "Arial, sans-serif" }}
                >
                  TECHNICAL SKILLS
                </h2>
                <div className="space-y-2">
                  {Object.entries(resume.skills || {}).map(([category, skills]) => (
                    <div
                      key={category}
                      className="text-sm"
                      style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                    >
                      <span
                        className="font-semibold text-gray-900"
                        style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                      >
                        {category}:{" "}
                      </span>
                      <span
                        className="text-gray-700"
                        style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                      >
                        {Array.isArray(skills) ? skills.join(", ") : skills}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Experience */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2"
                  style={{ fontSize: "14pt", fontFamily: "Arial, sans-serif" }}
                >
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className="space-y-4">
                  {(resume.experience || []).map((exp, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start">
                        <h3
                          className="font-semibold text-gray-900"
                          style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                        >
                          {exp.title}
                        </h3>
                        <span
                          className="text-sm text-gray-600"
                          style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                        >
                          {exp.period}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        {(exp.bullets || []).map((bullet, bulletIndex) => (
                          <li
                            key={bulletIndex}
                            className="text-sm text-gray-700"
                            style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Projects */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2"
                  style={{ fontSize: "14pt", fontFamily: "Arial, sans-serif" }}
                >
                  SELECTED PROJECTS
                </h2>
                <div className="space-y-4">
                  {(resume.projects || []).map((project, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start">
                        <h3
                          className="font-semibold text-gray-900"
                          style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                        >
                          {project.title}
                        </h3>
                        <span
                          className="text-sm text-gray-600"
                          style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                        >
                          {(project as any)?.is_ongoing !== undefined
                            ? ((project as any)?.is_ongoing
                                ? "Ongoing"
                                : `${formatMonthYear((project as any)?.start_date || "")} - ${formatMonthYear((project as any)?.end_date || "")}`)
                            : project.period}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        {(project.bullets || []).map((bullet, bulletIndex) => (
                          <li
                            key={bulletIndex}
                            className="text-sm text-gray-700"
                            style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education - Using dynamic user profile data */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2"
                  style={{ fontSize: "14pt", fontFamily: "Arial, sans-serif" }}
                >
                  EDUCATION
                </h2>
                {educationArray.length > 0 ? (
                  <div className="space-y-3">
                    {educationArray.map((edu, index) => (
                      <div key={index}>
                        <h3
                          className="font-semibold text-gray-900"
                          style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                        >
                          {edu.degree || "Degree"} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                        </h3>
                        <p
                          className="text-sm text-gray-700"
                          style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                        >
                          {edu.institution || "Institution"} - {edu.location || "Location"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatMonthYear(edu.start_date)} - {formatMonthYear(edu.end_date)}
                        </p>
                        {edu.gpa && (
                          <p
                            className="text-sm text-gray-700"
                            style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                          >
                            GPA: {edu.gpa}
                          </p>
                        )}
                        {edu.achievements && (
                          <p
                            className="text-sm text-gray-700"
                            style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                          >
                            {edu.achievements}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ No education data found in user profile. Please complete your profile to see your actual
                      education here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
