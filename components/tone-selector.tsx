"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import type { ToneAnalysis, ToneType } from "@/lib/tone-analyzer"
import { getToneDescription } from "@/lib/tone-analyzer"

interface ToneSelectorProps {
  toneAnalysis: ToneAnalysis
  selectedTone: ToneType | "auto"
  onToneChange: (tone: ToneType | "auto") => void
  className?: string
}

export function ToneSelector({ toneAnalysis, selectedTone, onToneChange, className }: ToneSelectorProps) {
  const [showDetails, setShowDetails] = useState(false)

  const toneOptions: Array<{ value: ToneType | "auto"; label: string; description: string }> = [
    { value: "auto", label: "Auto-detected", description: "Use AI-detected tone from job description" },
    { value: "professional", label: "Professional", description: getToneDescription("professional") },
    { value: "friendly", label: "Friendly", description: getToneDescription("friendly") },
    { value: "bold", label: "Bold", description: getToneDescription("bold") },
    { value: "enthusiastic", label: "Enthusiastic", description: getToneDescription("enthusiastic") },
    { value: "humble", label: "Humble", description: getToneDescription("humble") },
    { value: "innovative", label: "Innovative", description: getToneDescription("innovative") },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-blue-800 font-medium">Tone Analysis</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Info className="h-4 w-4 mr-1" />
            {showDetails ? "Hide" : "Show"} Details
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 text-sm">Detected tone:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {toneAnalysis.detectedTone.charAt(0).toUpperCase() + toneAnalysis.detectedTone.slice(1)}
            </Badge>
            <span className="text-blue-600 text-sm">({toneAnalysis.confidence}% confidence)</span>
          </div>

          {toneAnalysis.companyTraits.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-blue-700 text-sm">Company traits:</span>
              {toneAnalysis.companyTraits.map((trait, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          )}

          {showDetails && (
            <div className="mt-3 space-y-2 text-sm text-blue-700">
              {toneAnalysis.keywords.length > 0 && (
                <div>
                  <span className="font-medium">Keywords found:</span> {toneAnalysis.keywords.join(", ")}
                </div>
              )}
              {toneAnalysis.missionFocus.length > 0 && (
                <div>
                  <span className="font-medium">Mission indicators:</span> {toneAnalysis.missionFocus.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Cover Letter Tone</label>
        <Select value={selectedTone} onValueChange={onToneChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            {toneOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {option.label}
                    {option.value === "auto" && ` (${toneAnalysis.detectedTone})`}
                  </span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
