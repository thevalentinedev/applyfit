"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Loader2, RefreshCw, ChevronDown, Sparkles } from "lucide-react"
import type { GeneratedCoverLetter } from "@/app/actions/generate-cover-letter"
import { exportCoverLetterToDocx } from "@/lib/docx-export"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CoverLetterPreviewProps {
  coverLetter: GeneratedCoverLetter
  onRegenerate: () => void
  isRegenerating?: boolean
  onBack: () => void
  toneAnalysis: any
  selectedTone: any
  onToneChange: (tone: any) => void
}

export function CoverLetterPreview({
  coverLetter,
  onRegenerate,
  isRegenerating = false,
  onBack,
}: CoverLetterPreviewProps) {
  const { toast } = useToast()
  const coverLetterRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [smartFeaturesEnabled, setSmartFeaturesEnabled] = useState(true)

  const handleDownloadDOCX = async () => {
    setIsExporting(true)
    try {
      await exportCoverLetterToDocx(coverLetter)
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
    if (!coverLetterRef.current) return
    setIsExporting(true)

    try {
      toast({
        title: "Generating PDF",
        description: "Preparing your cover letter for download...",
      })

      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule

      if (typeof html2pdf !== "function") {
        throw new Error("html2pdf library failed to load properly")
      }

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: "Valentine_Ohalebo_Cover_Letter.pdf",
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

      const clonedElement = coverLetterRef.current.cloneNode(true) as HTMLElement
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
        title: "Cover letter downloaded",
        description: "Your cover letter has been downloaded as a PDF file.",
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

  if (!coverLetter.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-medium mb-2">Cover Letter Generation Failed</h3>
        <p className="text-red-600 mb-4">{coverLetter.error}</p>
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
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Resume
        </Button>

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

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-1 max-h-[600px] overflow-y-auto">
        <div
          ref={coverLetterRef}
          className="bg-white p-8 w-full max-w-[8.5in] mx-auto font-sans"
          style={{
            minHeight: "11in",
            fontFamily: "Arial, sans-serif",
            fontSize: "11pt",
            lineHeight: "1.15",
            margin: "0.75in",
          }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-lg font-bold text-[#1E293B]"
              style={{ fontSize: "14pt", fontFamily: "Arial, sans-serif" }}
            >
              Valentine Ohalebo
            </h1>
            <div
              className="text-sm text-[#475569]"
              style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.location} ·
              <a href="mailto:hello@valentine.dev" className="text-blue-600 hover:underline">
                hello@valentine.dev
              </a>{" "}
              ·
              <a
                href="https://valentine.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                valentine.dev
              </a>
            </div>
            <div
              className="text-sm text-[#475569]"
              style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              <a
                href="https://www.linkedin.com/in/valentine-ohalebo-51bb37221/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>{" "}
              |
              <a
                href="https://github.com/thevalentinedev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Github
              </a>
            </div>
            <div
              className="text-sm text-[#475569] mt-2"
              style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              Date: {coverLetter.date}
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <div
              className="text-sm text-[#1E293B]"
              style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.recipient.name}
            </div>
            <div
              className="text-sm text-[#1E293B]"
              style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.recipient.company}
            </div>
            <div
              className="text-sm text-[#1E293B]"
              style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.recipient.location}
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-4">
            <div
              className="text-sm text-[#1E293B]"
              style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.greeting}
            </div>
          </div>

          {/* Body */}
          <div className="mb-6 space-y-4">
            <p
              className="text-sm text-[#1E293B] leading-relaxed"
              style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.body.hook}
            </p>
            <p
              className="text-sm text-[#1E293B] leading-relaxed"
              style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.body.skills}
            </p>
            <p
              className="text-sm text-[#1E293B] leading-relaxed"
              style={{ fontSize: "11pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
            >
              {coverLetter.body.closing}
            </p>
          </div>

          {/* Closing */}
          <div
            className="text-sm text-[#1E293B]"
            style={{ fontSize: "10pt", fontFamily: "Arial, sans-serif", lineHeight: "1.15" }}
          >
            <div>Warm regards,</div>
            <div className="mt-2 font-semibold">Valentine Ohalebo</div>
          </div>
        </div>
      </div>
    </div>
  )
}
