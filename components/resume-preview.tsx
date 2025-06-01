"use client"

import { useState } from "react"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { Button } from "@/components/ui/button"
import { CoverLetterPreview } from "./cover-letter-preview"
import { generateCoverLetter } from "@/app/actions/generate-cover-letter"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ToneSelector } from "./tone-selector"
import { analyzeTone, type ToneType } from "@/lib/tone-analyzer"

interface ResumePreviewProps {
  resume: GeneratedResume
  onPreviewResume: () => void
  jobTitle: string
  companyName: string
  jobDescription: string
  useGpt4: boolean
}

export function ResumePreview({
  resume,
  onPreviewResume,
  jobTitle,
  companyName,
  jobDescription,
  useGpt4,
}: ResumePreviewProps) {
  const { toast } = useToast()
  const [coverLetter, setCoverLetter] = useState<GeneratedCoverLetter | null>(null)
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [showToneSelector, setShowToneSelector] = useState(false)
  const [selectedTone, setSelectedTone] = useState<ToneType | "auto">("auto")

  // Analyze tone from job description
  const toneAnalysis = analyzeTone(jobDescription)

  const handleGenerateCoverLetter = async (tone: ToneType | "auto" = selectedTone) => {
    setIsGeneratingCoverLetter(true)
    try {
      const generatedCoverLetter = await generateCoverLetter(
        jobTitle,
        companyName,
        jobDescription,
        {
          summary: resume.summary,
          skills: resume.skills,
          experience: resume.experience,
          projects: resume.projects,
        },
        useGpt4,
        tone,
      )

      if (generatedCoverLetter.success) {
        setCoverLetter(generatedCoverLetter)
        setShowCoverLetter(true)
        toast({
          title: "Cover letter generated",
          description: `Created with ${generatedCoverLetter.toneUsed || "auto-detected"} tone. Your personalized cover letter is ready!`,
          variant: "success",
        })
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

  if (!resume.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-medium mb-2">Resume Generation Failed</h3>
        <p className="text-red-600">{resume.error}</p>
      </div>
    )
  }

  if (showCoverLetter && coverLetter) {
    return (
      <CoverLetterPreview
        coverLetter={coverLetter}
        onRegenerate={handleRegenerateCoverLetter}
        isRegenerating={isGeneratingCoverLetter}
        onBack={() => setShowCoverLetter(false)}
        toneAnalysis={toneAnalysis}
        selectedTone={selectedTone}
        onToneChange={setSelectedTone}
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#1E293B] mb-4">Generated Resume Content</h3>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Professional Summary</h4>
        <p className="text-[#1E293B] text-sm leading-relaxed">{resume.summary}</p>
      </div>

      {/* Technical Skills */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Technical Skills</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(resume.skills).map(([category, skills]) => (
            <div key={category} className="bg-[#F8FAFC] rounded-lg p-3">
              <h5 className="font-medium text-[#1E293B] text-sm mb-2">{category}</h5>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill, index) => (
                  <span key={index} className="inline-block bg-[#3B82F6] text-white text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Professional Experience</h4>
        <div className="space-y-4">
          {resume.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-[#3B82F6] pl-4">
              <div className="flex justify-between items-start mb-1">
                <h5 className="font-medium text-[#1E293B]">{exp.title}</h5>
                <span className="text-xs text-[#64748B]">{exp.period}</span>
              </div>
              <ul className="space-y-1">
                {exp.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="text-sm text-[#475569] flex items-start">
                    <span className="text-[#3B82F6] mr-2">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Projects */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Selected Projects</h4>
        <div className="space-y-4">
          {resume.projects.map((project, index) => (
            <div key={index} className="border-l-2 border-green-500 pl-4">
              <div className="flex justify-between items-start mb-1">
                <h5 className="font-medium text-[#1E293B]">{project.title}</h5>
                <span className="text-xs text-[#64748B]">{project.period}</span>
              </div>
              <ul className="space-y-1">
                {project.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="text-sm text-[#475569] flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Tone Selector */}
        {showToneSelector && (
          <ToneSelector toneAnalysis={toneAnalysis} selectedTone={selectedTone} onToneChange={setSelectedTone} />
        )}

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerateCoverLetter()}
              disabled={isGeneratingCoverLetter}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGeneratingCoverLetter ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Cover Letter"
              )}
            </Button>
            <Button
              onClick={() => setShowToneSelector(!showToneSelector)}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              {showToneSelector ? "Hide" : "Customize"} Tone
            </Button>
          </div>
          <Button onClick={onPreviewResume} className="bg-[#3B82F6] hover:bg-blue-600 text-white px-6">
            Preview Resume →
          </Button>
        </div>
      </div>
    </div>
  )
}
