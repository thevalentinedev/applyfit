"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Loader2, Mail, FileText, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GeneratedResume } from "@/app/actions/generate-resume"
import type { UserProfile } from "@/app/actions/generate-resume"
import type { JobDetails } from "@/app/actions/parse-job"
import { exportResumeToDocx } from "@/lib/docx-export"
import { useToast } from "@/hooks/use-toast"

interface ResumeFullPreviewProps {
  resume: GeneratedResume
  userProfile: UserProfile
  jobDetails: JobDetails
  onBack: () => void
  onGenerateCoverLetter?: () => void
  isGeneratingCoverLetter?: boolean
}

export function ResumeFullPreview({
  resume,
  userProfile,
  jobDetails,
  onBack,
  onGenerateCoverLetter,
  isGeneratingCoverLetter = false,
}: ResumeFullPreviewProps) {
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleDownloadDOCX = async () => {
    setIsExporting(true)
    try {
      await exportResumeToDocx(resume)
      toast({
        title: "Resume downloaded",
        description: "Your resume has been downloaded as a DOCX file.",
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
    if (!resumeRef.current) return
    setIsExporting(true)

    try {
      toast({
        title: "Generating PDF",
        description: "Preparing your resume for download...",
      })

      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule

      if (typeof html2pdf !== "function") {
        throw new Error("html2pdf library failed to load properly")
      }

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${userProfile.name.replace(/\s+/g, "_")}_Resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      }

      const clonedElement = resumeRef.current.cloneNode(true) as HTMLElement
      clonedElement.style.width = "8.5in"
      clonedElement.style.padding = "0.5in"
      clonedElement.style.backgroundColor = "white"
      clonedElement.style.color = "black"
      clonedElement.style.fontFamily = "Arial, sans-serif"
      clonedElement.style.fontSize = "12px"
      clonedElement.style.lineHeight = "1.4"

      const interactiveElements = clonedElement.querySelectorAll("button, .hover\\:underline")
      interactiveElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.textDecoration = "none"
          el.style.color = "inherit"
        }
      })

      const worker = html2pdf().set(opt).from(clonedElement)
      await worker.save()

      toast({
        title: "Resume downloaded",
        description: "Your resume has been downloaded as a PDF file.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)

      let errorMessage = "Failed to generate PDF file. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("html2pdf")) {
          errorMessage = "PDF library failed to load. Please refresh the page and try again."
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again."
        }
      }

      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
        <p className="text-gray-600">Review your final resume and download</p>
      </div>

      {/* Tool Panel */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {onGenerateCoverLetter && (
            <Button
              onClick={onGenerateCoverLetter}
              disabled={isGeneratingCoverLetter || isExporting}
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
          )}
        </div>

        {/* Consolidated Download Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white" disabled={isExporting}>
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

      {/* Resume Preview Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Final Resume
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
              {/* Header */}
              <div className="text-center mb-6">
                <h1
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontSize: "16pt", fontFamily: "Arial, sans-serif" }}
                >
                  Valentine Ohalebo - {resume.jobTitle}
                </h1>
                <div
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                >
                  {resume.location} •{" "}
                  <a
                    href="mailto:hello@valentine.dev"
                    className="text-blue-600 hover:underline"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    hello@valentine.dev
                  </a>{" "}
                  •{" "}
                  <a
                    href="https://valentine.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    valentine.dev
                  </a>
                </div>
                <div
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                >
                  <a
                    href="https://www.linkedin.com/in/valentine-ohalebo-51bb37221/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    LinkedIn
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://github.com/thevalentinedev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    GitHub
                  </a>
                </div>
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
                  {Object.entries(resume.skills).map(([category, skills]) => (
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
                        {skills.join(", ")}
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
                  {resume.experience.map((exp, index) => (
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
                        {exp.bullets.map((bullet, bulletIndex) => (
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
                  {resume.projects.map((project, index) => (
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
                          {project.period}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        {project.bullets.map((bullet, bulletIndex) => (
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

              {/* Education */}
              <div className="mb-6">
                <h2
                  className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-2"
                  style={{ fontSize: "14pt", fontFamily: "Arial, sans-serif" }}
                >
                  EDUCATION
                </h2>
                <div>
                  <h3
                    className="font-semibold text-gray-900"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    Ontario College Diploma, Computer Programming - 2025
                  </h3>
                  <p
                    className="text-sm text-gray-700"
                    style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
                  >
                    Conestoga College - Waterloo, ON
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-1 text-sm text-gray-700">
                    <li style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}>
                      GPA: 3.92 (High Distinction)
                    </li>
                    <li style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}>
                      Courses: Web Development, OOP, UI/UX Design, Data Structures
                    </li>
                    <li style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}>
                      Awards: Best Final Year Project, Tech Showcase 2025, Best of Program, Capstone Project Award
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
