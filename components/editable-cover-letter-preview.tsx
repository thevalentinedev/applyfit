"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Loader2, RefreshCw, Mail, ChevronDown, Sparkles, RotateCcw } from "lucide-react"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { exportCoverLetterToDocx, exportCoverLetterToPDF } from "@/lib/docx-export"
import { useToast } from "@/hooks/use-toast"
import { EditableSection } from "./editable-section"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EditableCoverLetterPreviewProps {
  coverLetter: GeneratedCoverLetter
  onRegenerate: () => void
  isRegenerating?: boolean
  onBack: () => void
  toneAnalysis: any
  selectedTone: any
  onToneChange: (tone: any) => void
  sectionContext: {
    jobTitle: string
    companyName: string
    jobDescription: string
    userProfile?: any
    useGpt4?: boolean
  }
  onStartOver?: () => void
}

export function EditableCoverLetterPreview({
  coverLetter,
  onRegenerate,
  isRegenerating = false,
  onBack,
  sectionContext,
  onStartOver,
}: EditableCoverLetterPreviewProps) {
  const { toast } = useToast()
  const coverLetterRef = useRef<HTMLDivElement>(null)
  const [currentCoverLetter, setCurrentCoverLetter] = useState(coverLetter)
  const [isExporting, setIsExporting] = useState(false)
  const [smartFeaturesEnabled, setSmartFeaturesEnabled] = useState(true)

  const handleSectionUpdate = (section: keyof typeof currentCoverLetter.body, newContent: string) => {
    setCurrentCoverLetter((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        [section]: newContent,
      },
    }))
  }

  const handleDownloadDOCX = async () => {
    setIsExporting(true)
    try {
      await exportCoverLetterToDocx(currentCoverLetter)
      toast({
        title: "Cover letter downloaded",
        description: "Your cover letter has been downloaded as a DOCX file.",
        variant: "success",
      })
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
      await exportCoverLetterToPDF(currentCoverLetter)
      toast({
        title: "Cover letter downloaded",
        description: "Your cover letter has been downloaded as a PDF file.",
        variant: "success",
      })
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

  if (!currentCoverLetter.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-medium mb-2">Cover Letter Generation Failed</h3>
        <p className="text-red-600 mb-4">{currentCoverLetter.error}</p>
        <Button onClick={onRegenerate} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cover Letter Generated</h2>
        <p className="text-gray-600">Customize and download your cover letter</p>
      </div>

      {/* Tools Panel */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Resume
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

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating || isExporting}
            className="flex items-center gap-2"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Generate Another
              </>
            )}
          </Button>

          {/* Download Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isExporting}
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadDOCX} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Download as DOCX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Smart Features Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <Switch id="smart-features" checked={smartFeaturesEnabled} onCheckedChange={setSmartFeaturesEnabled} />
          <p className="text-sm text-gray-700">Enable smart AI features</p>
        </div>

        {!smartFeaturesEnabled && (
          <div className="flex items-center space-x-2">
            <Label htmlFor="tone-select" className="text-sm text-gray-700">
              Cover Letter Tone:
            </Label>
            <select
              id="tone-select"
              className="text-sm border border-gray-300 rounded px-2 py-1"
              defaultValue="professional"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="bold">Bold</option>
              <option value="humble">Humble</option>
            </select>
          </div>
        )}
      </div>

      {/* Cover Letter Preview */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Cover Letter Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1">
          <div className="bg-white border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
            <div
              ref={coverLetterRef}
              className="bg-white p-8 w-full max-w-[8.5in] mx-auto font-sans"
              style={{ minHeight: "11in" }}
            >
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-lg font-bold text-gray-900">Valentine Ohalebo</h1>
                <div className="text-sm text-gray-600">
                  {currentCoverLetter.location} ·{" "}
                  <a href="mailto:hello@valentine.dev" className="text-blue-600 hover:underline">
                    hello@valentine.dev
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://valentine.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    valentine.dev
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  <a
                    href="https://www.linkedin.com/in/valentine-ohalebo-51bb37221/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://github.com/thevalentinedev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Github
                  </a>
                </div>
                <div className="text-sm text-gray-600 mt-2">Date: {currentCoverLetter.date}</div>
              </div>

              {/* Recipient */}
              <div className="mb-6">
                <div className="text-sm text-gray-900">{currentCoverLetter.recipient.name}</div>
                <div className="text-sm text-gray-900">{currentCoverLetter.recipient.company}</div>
                <div className="text-sm text-gray-900">{currentCoverLetter.recipient.location}</div>
              </div>

              {/* Greeting */}
              <div className="mb-4">
                <div className="text-sm text-gray-900">{currentCoverLetter.greeting}</div>
              </div>

              {/* Body - Editable Sections */}
              <div className="mb-6 space-y-4">
                <EditableSection
                  content={currentCoverLetter.body.hook}
                  onUpdate={(content) => handleSectionUpdate("hook", content)}
                  sectionType="cover-letter"
                  sectionContext={{
                    ...sectionContext,
                    // Add additional context for cover letter refinement
                    coverLetterSection: "hook",
                  }}
                  multiline={true}
                  placeholder="Enter your opening hook..."
                  label="Opening Hook"
                  className="text-sm text-gray-900 leading-relaxed"
                />

                <EditableSection
                  content={currentCoverLetter.body.skills}
                  onUpdate={(content) => handleSectionUpdate("skills", content)}
                  sectionType="cover-letter"
                  sectionContext={{
                    ...sectionContext,
                    // Add additional context for cover letter refinement
                    coverLetterSection: "skills",
                  }}
                  multiline={true}
                  placeholder="Enter your skills and experience highlights..."
                  label="Skills & Experience"
                  className="text-sm text-gray-900 leading-relaxed"
                />

                <EditableSection
                  content={currentCoverLetter.body.closing}
                  onUpdate={(content) => handleSectionUpdate("closing", content)}
                  sectionType="cover-letter"
                  sectionContext={{
                    ...sectionContext,
                    // Add additional context for cover letter refinement
                    coverLetterSection: "closing",
                  }}
                  multiline={true}
                  placeholder="Enter your closing statement..."
                  label="Closing Statement"
                  className="text-sm text-gray-900 leading-relaxed"
                />
              </div>

              {/* Closing */}
              <div className="text-sm text-gray-900">
                <div>Warm regards,</div>
                <div className="mt-2 font-semibold">Valentine Ohalebo</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
