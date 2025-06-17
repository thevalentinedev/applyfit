"use client"

import { useState, useEffect } from "react"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditableCoverLetterPreview } from "./editable-cover-letter-preview"
import { ResumeFullPreview } from "./resume-full-preview"
import { generateCoverLetter } from "@/app/actions/generate-cover-letter"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, ArrowLeft, Mail, Eye, RotateCcw } from "lucide-react"
import { EditableSection } from "./editable-section"
import { analyzeTone, type ToneType } from "@/lib/tone-analyzer"
import { CacheManager } from "@/lib/cache-manager"
import { useResumeAutoSave } from "@/hooks/use-auto-save"
import { Badge } from "@/components/ui/badge"
import { ATSScoreCompact } from "./ats-score-compact"
import { scoreResumeAction, type ATSScoreResult } from "@/app/actions/score-resume"
import { refineResumeSection } from "@/app/actions/refine-section"

interface EditableResumePreviewProps {
  resume: GeneratedResume
  onPreviewResume?: () => void
  jobTitle: string
  companyName: string
  jobDescription: string
  useGpt4: boolean
  userProfile: {
    id?: string
    full_name?: string
    email?: string
    phone?: string
    location?: string
    website?: string
    linkedin_url?: string
    github_url?: string
    bio?: string
    education?: any[]
    professional_experience?: any[]
    projects_achievements?: any[]
    skills?: string[]
    experience_level?: string
    summary?: string
    experience?: string
    projects?: string
    // Additional fields for compatibility
    name?: string
    portfolio?: string
    portfolio_url?: string
  }
  onResumeUpdate: (updatedResume: GeneratedResume) => void
  onBack?: () => void
  showFullPreview?: boolean
  onStartOver?: () => void
}

// Helper function to safely get arrays
const safeGetArray = (data: any): any[] => {
  if (Array.isArray(data)) return data
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

// Helper function to safely get skills object
const safeGetSkills = (skills: any): { [key: string]: string[] } => {
  if (skills && typeof skills === "object" && !Array.isArray(skills)) {
    return skills
  }
  if (Array.isArray(skills)) {
    return { "Technical Skills": skills }
  }
  return { "Technical Skills": [] }
}

// Helper function to safely get user profile data
const safeGetUserData = (userProfile: any, field: string, fallback = "") => {
  return userProfile?.[field] || fallback
}

export function EditableResumePreview({
  resume,
  onPreviewResume,
  jobTitle,
  companyName,
  jobDescription,
  useGpt4,
  userProfile,
  onResumeUpdate,
  onBack,
  showFullPreview = false,
  onStartOver,
}: EditableResumePreviewProps) {
  const { toast } = useToast()
  const [currentResume, setCurrentResume] = useState(resume)
  const [coverLetter, setCoverLetter] = useState<GeneratedCoverLetter | null>(null)
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [showFullResumePreview, setShowFullResumePreview] = useState(false)
  const [selectedTone, setSelectedTone] = useState<ToneType | "auto">("auto")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [atsScore, setAtsScore] = useState<ATSScoreResult | null>(null)
  const [isLoadingScore, setIsLoadingScore] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Extract user profile data for proper mapping
  const userName = safeGetUserData(userProfile, "full_name", safeGetUserData(userProfile, "name", "Your Name"))
  const userEmail = safeGetUserData(userProfile, "email", "your.email@example.com")
  const userPhone = safeGetUserData(userProfile, "phone", "")
  const userWebsite = safeGetUserData(
    userProfile,
    "website",
    safeGetUserData(userProfile, "portfolio", safeGetUserData(userProfile, "portfolio_url", "")),
  )
  const userLinkedIn = safeGetUserData(userProfile, "linkedin_url", "")
  const userGitHub = safeGetUserData(userProfile, "github_url", "")

  // Load ATS score when resume changes
  useEffect(() => {
    const loadATSScore = async () => {
      if (!currentResume || !currentResume.success) return

      setIsLoadingScore(true)
      try {
        console.log("🔄 Refreshing ATS score after resume changes...")
        const scoreResult = await scoreResumeAction(currentResume, jobDescription, useGpt4)
        setAtsScore(scoreResult)
        console.log("✅ ATS score updated:", scoreResult.score)
      } catch (error) {
        console.error("Failed to load ATS score:", error)
      } finally {
        setIsLoadingScore(false)
      }
    }

    // Add a small delay to allow UI updates to complete
    const timeoutId = setTimeout(loadATSScore, 500)
    return () => clearTimeout(timeoutId)
  }, [currentResume, jobDescription, useGpt4])

  // Debug logging
  useEffect(() => {
    console.log("🔍 EditableResumePreview - User Profile Data Mapping:", {
      userName,
      userEmail,
      userPhone,
      userWebsite,
      userLinkedIn,
      userGitHub,
      originalProfile: userProfile,
    })
    console.log("🔍 EditableResumePreview - Resume Data:", currentResume)
  }, [userProfile, currentResume, userName, userEmail, userPhone, userWebsite, userLinkedIn, userGitHub])

  // Analyze tone from job description
  const toneAnalysis = analyzeTone(jobDescription)

  // Context for section refinement
  const sectionContext = {
    jobTitle,
    companyName,
    jobDescription,
    userProfile,
    useGpt4,
  }

  // Auto-save resume changes
  useResumeAutoSave(
    {
      summary: currentResume?.summary || "",
      skills: currentResume?.skills || {},
      experience: currentResume?.experience || [],
      projects: currentResume?.projects || [],
      userProfile,
    },
    {
      jobTitle,
      companyName,
    },
    true,
  )

  // Update last saved timestamp when auto-save occurs
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(new Date())
    }, 2000)

    return () => clearInterval(interval)
  }, [currentResume])

  const updateResume = (updatedResume: GeneratedResume) => {
    setCurrentResume(updatedResume)
    onResumeUpdate(updatedResume)
  }

  const handleSummaryUpdate = (newSummary: string) => {
    const updated = { ...currentResume, summary: newSummary }
    updateResume(updated)
  }

  const handleSkillsUpdate = (category: string, newSkills: string) => {
    const skillsArray = newSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const updated = {
      ...currentResume,
      skills: {
        ...safeGetSkills(currentResume?.skills),
        [category]: skillsArray,
      },
    }
    updateResume(updated)
  }

  const handleExperienceBulletUpdate = (expIndex: number, bulletIndex: number, newBullet: string) => {
    const experienceArray = safeGetArray(currentResume?.experience)
    if (experienceArray[expIndex] && experienceArray[expIndex].bullets) {
      const updated = { ...currentResume }
      updated.experience = [...experienceArray]
      updated.experience[expIndex] = {
        ...updated.experience[expIndex],
        bullets: [...updated.experience[expIndex].bullets],
      }
      updated.experience[expIndex].bullets[bulletIndex] = newBullet
      updateResume(updated)
    }
  }

  const handleProjectBulletUpdate = (projectIndex: number, bulletIndex: number, newBullet: string) => {
    const projectsArray = safeGetArray(currentResume?.projects)
    if (projectsArray[projectIndex] && projectsArray[projectIndex].bullets) {
      const updated = { ...currentResume }
      updated.projects = [...projectsArray]
      updated.projects[projectIndex] = {
        ...updated.projects[projectIndex],
        bullets: [...updated.projects[projectIndex].bullets],
      }
      updated.projects[projectIndex].bullets[bulletIndex] = newBullet
      updateResume(updated)
    }
  }

  // Handle section regeneration from ATS optimization
  const handleRegenerateSection = async (section: string, reason: string) => {
    setIsOptimizing(true)
    console.log("Regenerating section:", section, reason)

    try {
      if (section === "auto") {
        // Auto-optimize all sections
        toast({
          title: "Auto-optimizing resume",
          description: "Improving all sections for better ATS compatibility...",
        })

        // Regenerate summary
        const improvedSummary = await refineResumeSection(
          "summary",
          currentResume.summary,
          jobDescription,
          jobTitle,
          companyName,
          useGpt4,
        )

        // Regenerate skills (convert to string for refinement)
        const skillsString = Object.entries(safeGetSkills(currentResume.skills))
          .map(([category, skills]) => `${category}: ${skills.join(", ")}`)
          .join("\n")

        const improvedSkills = await refineResumeSection(
          "skills",
          skillsString,
          jobDescription,
          jobTitle,
          companyName,
          useGpt4,
        )

        // Update resume with improvements
        const updated = {
          ...currentResume,
          summary: improvedSummary,
          // Parse improved skills back to object format
          skills: improvedSkills.split("\n").reduce(
            (acc, line) => {
              const [category, skillsStr] = line.split(":")
              if (category && skillsStr) {
                acc[category.trim()] = skillsStr.split(",").map((s) => s.trim())
              }
              return acc
            },
            {} as { [key: string]: string[] },
          ),
        }

        updateResume(updated)

        toast({
          title: "Resume optimized!",
          description: "All sections have been improved for better ATS compatibility.",
          variant: "success",
        })
      } else if (section === "summary") {
        const improvedSummary = await refineResumeSection(
          "summary",
          currentResume.summary,
          jobDescription,
          jobTitle,
          companyName,
          useGpt4,
        )

        const updated = { ...currentResume, summary: improvedSummary }
        updateResume(updated)

        toast({
          title: "Summary regenerated",
          description: "Professional summary has been optimized for ATS compatibility.",
          variant: "success",
        })
      } else if (section === "skills") {
        const skillsString = Object.entries(safeGetSkills(currentResume.skills))
          .map(([category, skills]) => `${category}: ${skills.join(", ")}`)
          .join("\n")

        const improvedSkills = await refineResumeSection(
          "skills",
          skillsString,
          jobDescription,
          jobTitle,
          companyName,
          useGpt4,
        )

        // Parse improved skills back to object format
        const skillsObject = improvedSkills.split("\n").reduce(
          (acc, line) => {
            const [category, skillsStr] = line.split(":")
            if (category && skillsStr) {
              acc[category.trim()] = skillsStr.split(",").map((s) => s.trim())
            }
            return acc
          },
          {} as { [key: string]: string[] },
        )

        const updated = { ...currentResume, skills: skillsObject }
        updateResume(updated)

        toast({
          title: "Skills improved",
          description: "Skills section has been aligned with job requirements.",
          variant: "success",
        })
      } else if (section === "experience") {
        // Regenerate experience bullets
        const experienceArray = safeGetArray(currentResume.experience)
        const updatedExperience = await Promise.all(
          experienceArray.map(async (exp) => {
            if (exp.bullets && Array.isArray(exp.bullets)) {
              const improvedBullets = await Promise.all(
                exp.bullets.map((bullet) =>
                  refineResumeSection("experience", bullet, jobDescription, jobTitle, companyName, useGpt4),
                ),
              )
              return { ...exp, bullets: improvedBullets }
            }
            return exp
          }),
        )

        const updated = { ...currentResume, experience: updatedExperience }
        updateResume(updated)

        toast({
          title: "Experience bullets improved",
          description: "Experience section has been optimized with better action verbs and metrics.",
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Error regenerating section:", error)
      toast({
        title: "Optimization failed",
        description: "Failed to optimize the section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleGenerateCoverLetter = async (tone: ToneType | "auto" = selectedTone) => {
    setIsGeneratingCoverLetter(true)

    // First, try to find the application ID for this job
    let applicationId = null
    try {
      console.log("🔍 Searching for application ID...")
      console.log("🔍 Job Title:", jobTitle)
      console.log("🔍 Company Name:", companyName)

      // Call a function to get the application ID based on job details
      const response = await fetch("/api/applications/find-by-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          companyName,
          jobDescription: jobDescription.substring(0, 500), // Use first 500 chars for matching
        }),
      })

      if (response.ok) {
        const data = await response.json()
        applicationId = data.applicationId
        console.log("✅ Found application ID:", applicationId)
      } else {
        console.log("⚠️ No matching application found in database")
      }
    } catch (error) {
      console.error("❌ Error fetching application ID:", error)
    }

    try {
      const generatedCoverLetter = await generateCoverLetter(
        jobTitle,
        companyName,
        jobDescription,
        {
          summary: currentResume?.summary || "",
          skills: safeGetSkills(currentResume?.skills),
          experience: safeGetArray(currentResume?.experience),
          projects: safeGetArray(currentResume?.projects),
        },
        useGpt4,
        tone,
      )

      if (generatedCoverLetter.success) {
        // Format the generated cover letter content
        const formattedCoverLetter = `${generatedCoverLetter.greeting}

${generatedCoverLetter.body.hook}

${generatedCoverLetter.body.skills}

${generatedCoverLetter.body.closing}

Best regards,
${userName}`

        // Ensure location is properly set from resume
        const updatedCoverLetter = {
          ...generatedCoverLetter,
          location: currentResume?.location || "Remote",
          content: formattedCoverLetter, // Add the formatted content
          applicationId: applicationId, // Add the application ID
        }

        setCoverLetter(updatedCoverLetter)
        setShowCoverLetter(true)
        toast({
          title: "Cover letter generated",
          description: `Created with ${updatedCoverLetter.toneUsed || "auto-detected"} tone.`,
          variant: "success",
        })

        // Save cover letter to cache
        if (sectionContext.jobTitle && sectionContext.companyName) {
          const sessions = CacheManager.getSessions()
          const currentSession = sessions.find(
            (s) =>
              s.jobDetails.jobTitle === sectionContext.jobTitle &&
              s.jobDetails.companyName === sectionContext.companyName,
          )

          if (currentSession) {
            // Only save serializable cover letter data
            const serializableCoverLetter = {
              success: updatedCoverLetter.success,
              content: updatedCoverLetter.content,
              location: updatedCoverLetter.location,
              toneUsed: updatedCoverLetter.toneUsed,
              error: updatedCoverLetter.error,
              applicationId: updatedCoverLetter.applicationId,
            }

            CacheManager.updateSession(currentSession.id, {
              coverLetter: serializableCoverLetter,
            })
          }
        }
      } else {
        toast({
          title: "Cover letter generation failed",
          description: generatedCoverLetter.error || "Failed to generate cover letter. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating cover letter:", error)
      toast({
        title: "Cover letter generation failed",
        description: "An unexpected error occurred. Please try again in a few moments.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const handleRegenerateCoverLetter = async () => {
    await handleGenerateCoverLetter(selectedTone)
  }

  // Check if resume is valid
  if (!currentResume || !currentResume.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-medium mb-2">Resume Generation Failed</h3>
        <p className="text-red-600">{currentResume?.error || "Unknown error occurred"}</p>
      </div>
    )
  }

  if (showCoverLetter && coverLetter) {
    return (
      <EditableCoverLetterPreview
        coverLetterContent={coverLetter.content || ""} // Use the already generated content
        userProfile={userProfile} // CRITICAL: Pass the actual userProfile here
        jobDetails={{
          title: jobTitle,
          company: companyName,
          description: jobDescription,
          applicationId: coverLetter.applicationId, // Pass the application ID
        }}
        resumeData={{
          summary: currentResume?.summary || "",
          skills: safeGetSkills(currentResume?.skills),
          experience: safeGetArray(currentResume?.experience),
          projects: safeGetArray(currentResume?.projects),
          applicationId: coverLetter.applicationId, // Also pass it in resumeData
        }}
        onContentChange={(content) => {
          if (coverLetter) {
            setCoverLetter({ ...coverLetter, content })
          }
        }}
      />
    )
  }

  if (showFullResumePreview) {
    return (
      <ResumeFullPreview
        resume={currentResume}
        userProfile={{
          // CRITICAL: Pass actual user profile data with proper mapping
          name: userName,
          full_name: userName,
          email: userEmail,
          phone: userPhone,
          location: currentResume.location || userProfile?.location || "Remote",
          portfolio: userWebsite,
          website: userWebsite,
          linkedin: userLinkedIn,
          linkedin_url: userLinkedIn,
          github: userGitHub,
          github_url: userGitHub,
          education: userProfile?.education || [],
          professional_experience: userProfile?.professional_experience || [],
          projects_achievements: userProfile?.projects_achievements || [],
          currentRole: jobTitle,
          experience:
            userProfile?.experience ||
            userProfile?.professional_experience
              ?.map(
                (exp) =>
                  `${exp.position} at ${exp.company} (${exp.start_date} - ${exp.end_date || "Present"}): ${exp.description}`,
              )
              .join("; ") ||
            "Experience not provided",
          projects:
            userProfile?.projects ||
            userProfile?.projects_achievements?.map((proj) => `${proj.title}: ${proj.description}`).join("; ") ||
            "Projects not provided",
        }}
        jobDetails={{
          jobTitle,
          companyName,
          location: currentResume.location,
          description: jobDescription,
          success: true,
        }}
        onBack={() => setShowFullResumePreview(false)}
        onGenerateCoverLetter={handleGenerateCoverLetter}
        isGeneratingCoverLetter={isGeneratingCoverLetter}
        onStartOver={onStartOver}
      />
    )
  }

  // Safe data extraction
  const resumeSkills = safeGetSkills(currentResume?.skills)
  const resumeExperience = safeGetArray(currentResume?.experience)
  const resumeProjects = safeGetArray(currentResume?.projects)

  return (
    <div className="space-y-6">
      {/* Header - Styled to match cover letter header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
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

        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full">
            <Save className="h-4 w-4 text-green-600" />
            <span>Auto-saved</span>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              Protected
            </Badge>
          </div>
        )}
      </div>

      {/* ATS Score - Compact Display */}
      {atsScore && (
        <ATSScoreCompact
          score={atsScore}
          suggestions={[]}
          onRegenerateSection={handleRegenerateSection}
          isOptimizing={isOptimizing}
        />
      )}

      {/* Resume Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📄 Resume Content - Dynamic User Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Professional Summary */}
          <div>
            <EditableSection
              content={currentResume?.summary || ""}
              onUpdate={handleSummaryUpdate}
              sectionType="summary"
              sectionContext={sectionContext}
              multiline={true}
              placeholder="Enter your professional summary..."
              label="Professional Summary"
            />
          </div>

          {/* Technical Skills */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Technical Skills</h4>
            {Object.keys(resumeSkills).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(resumeSkills).map(([category, skills]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 text-sm mb-2">{category}</h5>
                    <EditableSection
                      content={Array.isArray(skills) ? skills.join(", ") : ""}
                      onUpdate={(newSkills) => handleSkillsUpdate(category, newSkills)}
                      sectionType="skills"
                      sectionContext={sectionContext}
                      placeholder="Enter skills separated by commas..."
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No skills data available. Please complete your profile or generate a new resume.
              </div>
            )}
          </div>

          {/* Professional Experience */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Professional Experience</h4>
            {resumeExperience.length > 0 ? (
              <div className="space-y-4">
                {resumeExperience.map((exp, expIndex) => (
                  <div key={expIndex} className="border-l-4 border-blue-500 pl-4 bg-gray-50 rounded-r-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{exp?.title || "Position"}</h5>
                      <span className="text-xs text-gray-500">{exp?.period || "Period"}</span>
                    </div>
                    {exp?.bullets && Array.isArray(exp.bullets) ? (
                      <ul className="space-y-2">
                        {exp.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <div className="flex-1">
                              <EditableSection
                                content={bullet || ""}
                                onUpdate={(newBullet) => handleExperienceBulletUpdate(expIndex, bulletIndex, newBullet)}
                                sectionType="experience"
                                sectionContext={sectionContext}
                                enableBulletRefine={true}
                                bulletContext={{
                                  roleTitle: exp?.title || "Position",
                                  company: exp?.title?.split(" - ")[1] || "Company",
                                  isExperience: true,
                                }}
                                multiline={true}
                                placeholder="Enter experience bullet point..."
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">No bullet points available</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No experience data available. Please complete your profile or generate a new resume.
              </div>
            )}
          </div>

          {/* Selected Projects */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Selected Projects</h4>
            {resumeProjects.length > 0 ? (
              <div className="space-y-4">
                {resumeProjects.map((project, projectIndex) => (
                  <div key={projectIndex} className="border-l-4 border-green-500 pl-4 bg-gray-50 rounded-r-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{project?.title || "Project"}</h5>
                      <span className="text-xs text-gray-500">{project?.period || "Period"}</span>
                    </div>
                    {project?.bullets && Array.isArray(project.bullets) ? (
                      <ul className="space-y-2">
                        {project.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-500 mr-2 mt-1">•</span>
                            <div className="flex-1">
                              <EditableSection
                                content={bullet || ""}
                                onUpdate={(newBullet) =>
                                  handleProjectBulletUpdate(projectIndex, bulletIndex, newBullet)
                                }
                                sectionType="experience"
                                sectionContext={sectionContext}
                                enableBulletRefine={true}
                                bulletContext={{
                                  roleTitle: project?.title || "Project",
                                  company: "Project",
                                  isExperience: false,
                                }}
                                multiline={true}
                                placeholder="Enter project bullet point..."
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">No bullet points available</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No projects data available. Please complete your profile or generate a new resume.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button
          onClick={() => handleGenerateCoverLetter()}
          disabled={isGeneratingCoverLetter}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {isGeneratingCoverLetter ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Generate Cover Letter
            </>
          )}
        </Button>

        <Button
          onClick={() => setShowFullResumePreview(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Eye className="h-4 w-4" />
          Preview & Export
        </Button>
      </div>
    </div>
  )
}
