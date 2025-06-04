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
import { Loader2, Save, ArrowLeft, FileText, Mail, Eye, RotateCcw } from "lucide-react"
import { EditableSection } from "./editable-section"
import { analyzeTone, type ToneType } from "@/lib/tone-analyzer"
import { CacheManager } from "@/lib/cache-manager"
import { useResumeAutoSave } from "@/hooks/use-auto-save"
import { Badge } from "@/components/ui/badge"

interface EditableResumePreviewProps {
  resume: GeneratedResume
  onPreviewResume?: () => void
  jobTitle: string
  companyName: string
  jobDescription: string
  useGpt4: boolean
  userProfile: {
    summary: string
    skills: { [category: string]: string[] }
    experience: string
    projects: string
  }
  onResumeUpdate: (updatedResume: GeneratedResume) => void
  onBack?: () => void
  showFullPreview?: boolean
  onStartOver?: () => void
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
      summary: currentResume.summary,
      skills: currentResume.skills,
      experience: currentResume.experience,
      projects: currentResume.projects,
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
        ...currentResume.skills,
        [category]: skillsArray,
      },
    }
    updateResume(updated)
  }

  const handleExperienceBulletUpdate = (expIndex: number, bulletIndex: number, newBullet: string) => {
    const updated = { ...currentResume }
    updated.experience[expIndex].bullets[bulletIndex] = newBullet
    updateResume(updated)
  }

  const handleProjectBulletUpdate = (projectIndex: number, bulletIndex: number, newBullet: string) => {
    const updated = { ...currentResume }
    updated.projects[projectIndex].bullets[bulletIndex] = newBullet
    updateResume(updated)
  }

  const handleGenerateCoverLetter = async (tone: ToneType | "auto" = selectedTone) => {
    setIsGeneratingCoverLetter(true)
    try {
      const generatedCoverLetter = await generateCoverLetter(
        jobTitle,
        companyName,
        jobDescription,
        {
          summary: currentResume.summary,
          skills: currentResume.skills,
          experience: currentResume.experience,
          projects: currentResume.projects,
        },
        useGpt4,
        tone,
      )

      if (generatedCoverLetter.success) {
        // Ensure location is properly set from resume
        const updatedCoverLetter = {
          ...generatedCoverLetter,
          location: currentResume.location || "Remote",
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

  if (!currentResume.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-medium mb-2">Resume Generation Failed</h3>
        <p className="text-red-600">{currentResume.error}</p>
      </div>
    )
  }

  if (showCoverLetter && coverLetter) {
    return (
      <EditableCoverLetterPreview
        coverLetter={coverLetter}
        onRegenerate={handleRegenerateCoverLetter}
        isRegenerating={isGeneratingCoverLetter}
        onBack={() => setShowCoverLetter(false)}
        toneAnalysis={toneAnalysis}
        selectedTone={selectedTone}
        onToneChange={setSelectedTone}
        sectionContext={sectionContext}
        onStartOver={onStartOver}
      />
    )
  }

  if (showFullResumePreview) {
    return (
      <ResumeFullPreview
        resume={currentResume}
        userProfile={{
          name: "Valentine Ohalebo",
          email: "hello@valentine.dev",
          phone: "+1 647 282 8563",
          location: currentResume.location,
          portfolio: "https://valentine.dev",
          linkedin: "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
          github: "https://github.com/thevalentinedev",
          education: "Ontario College Diploma, Computer Programming - 2025, Conestoga College - Waterloo, ON",
          currentRole: "Full-Stack Developer & Creator",
          experience: userProfile.experience,
          projects: userProfile.projects,
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

      {/* Resume Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Professional Summary */}
          <div>
            <EditableSection
              content={currentResume.summary}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentResume.skills).map(([category, skills]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 text-sm mb-2">{category}</h5>
                  <EditableSection
                    content={skills.join(", ")}
                    onUpdate={(newSkills) => handleSkillsUpdate(category, newSkills)}
                    sectionType="skills"
                    sectionContext={sectionContext}
                    placeholder="Enter skills separated by commas..."
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Professional Experience */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Professional Experience</h4>
            <div className="space-y-4">
              {currentResume.experience.map((exp, expIndex) => (
                <div key={expIndex} className="border-l-4 border-blue-500 pl-4 bg-gray-50 rounded-r-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900">{exp.title}</h5>
                    <span className="text-xs text-gray-500">{exp.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <div className="flex-1">
                          <EditableSection
                            content={bullet}
                            onUpdate={(newBullet) => handleExperienceBulletUpdate(expIndex, bulletIndex, newBullet)}
                            sectionType="experience"
                            sectionContext={sectionContext}
                            enableBulletRefine={true}
                            bulletContext={{
                              roleTitle: exp.title,
                              company: exp.title.split(" - ")[1] || "Company",
                              isExperience: true,
                            }}
                            multiline={true}
                            placeholder="Enter experience bullet point..."
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Projects */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Selected Projects</h4>
            <div className="space-y-4">
              {currentResume.projects.map((project, projectIndex) => (
                <div key={projectIndex} className="border-l-4 border-green-500 pl-4 bg-gray-50 rounded-r-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900">{project.title}</h5>
                    <span className="text-xs text-gray-500">{project.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {project.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        <div className="flex-1">
                          <EditableSection
                            content={bullet}
                            onUpdate={(newBullet) => handleProjectBulletUpdate(projectIndex, bulletIndex, newBullet)}
                            sectionType="experience"
                            sectionContext={sectionContext}
                            enableBulletRefine={true}
                            bulletContext={{
                              roleTitle: project.title,
                              company: "ImageMark",
                              isExperience: false,
                            }}
                            multiline={true}
                            placeholder="Enter project bullet point..."
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
