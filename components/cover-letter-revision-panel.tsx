"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Zap, Info, Loader2 } from "lucide-react"
import type { RevisionSuggestion } from "@/lib/cover-letter-analyzer"

interface CoverLetterRevisionPanelProps {
  suggestions: RevisionSuggestion[]
  onReviseSection: (section: "hook" | "skills" | "closing", suggestionId: string) => void
  isRevising: boolean
}

export function CoverLetterRevisionPanel({ suggestions, onReviseSection, isRevising }: CoverLetterRevisionPanelProps) {
  const getSeverityIcon = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "medium":
        return <Zap className="w-4 h-4 text-yellow-500" />
      case "low":
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200"
      case "medium":
        return "bg-yellow-50 border-yellow-200"
      case "low":
        return "bg-blue-50 border-blue-200"
    }
  }

  const getBadgeVariant = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
    }
  }

  if (suggestions.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">Cover letter looks great! No major issues detected.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          This could be improved ({suggestions.length} issue{suggestions.length > 1 ? "s" : ""})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className={`p-4 rounded-lg border ${getSeverityColor(suggestion.severity)}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityIcon(suggestion.severity)}
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <Badge variant={getBadgeVariant(suggestion.severity)} className="text-xs">
                    {suggestion.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReviseSection(suggestion.section, suggestion.id)}
                disabled={isRevising}
                className="shrink-0"
              >
                {isRevising ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  "Fix This"
                )}
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <Button
            onClick={() => {
              // Fix all issues by regenerating with focus on all problems
              suggestions.forEach((suggestion) => {
                onReviseSection(suggestion.section, suggestion.id)
              })
            }}
            disabled={isRevising}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isRevising ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fixing All Issues...
              </>
            ) : (
              "Fix All Issues"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
