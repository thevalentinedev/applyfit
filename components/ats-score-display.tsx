"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Zap, BarChart3, Lightbulb } from "lucide-react"
import type { ATSScoreResult } from "@/lib/ats-scorer"
import type { OptimizationSuggestion } from "@/lib/ats-optimizer"
import { getScoreColor, getScoreBadgeVariant } from "@/lib/ats-scorer"

interface ATSScoreDisplayProps {
  score: ATSScoreResult
  suggestions?: OptimizationSuggestion[]
  onRegenerateSection?: (section: string, reason: string) => void
  isOptimizing?: boolean
  targetScore?: number
}

export function ATSScoreDisplay({
  score,
  suggestions = [],
  onRegenerateSection,
  isOptimizing = false,
  targetScore = 90,
}: ATSScoreDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)

  const meetsTarget = score.score >= targetScore
  const scoreColor = getScoreColor(score.score)
  const badgeVariant = getScoreBadgeVariant(score.score)

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <Card className={`border-2 ${meetsTarget ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ATS Compatibility Score
            </CardTitle>
            <Badge variant={badgeVariant} className="text-lg px-3 py-1">
              {score.score}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ATS Compatibility</span>
              <span className={scoreColor}>{score.score}%</span>
            </div>
            <Progress value={score.score} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="text-orange-600">Target: {targetScore}</span>
              <span>100</span>
            </div>
          </div>

          {/* Status Alert */}
          {meetsTarget ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 <strong>Excellent!</strong> Your resume meets ATS requirements and should pass initial screening.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Needs Improvement:</strong> Your resume may not pass ATS screening. Consider the suggestions
                below.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Feedback */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Key Feedback:</h4>
            <ul className="space-y-1">
              {score.feedback.slice(0, 3).map((item, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Toggle Details Button */}
          <Button variant="outline" onClick={() => setShowDetails(!showDetails)} className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            {showDetails ? "Hide" : "Show"} Detailed Breakdown
          </Button>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(score.breakdown).map(([category, categoryScore]) => {
              const percentage = (categoryScore / 20) * 100
              const categoryColor = getScoreColor(percentage)

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{category.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className={`text-sm font-medium ${categoryColor}`}>{categoryScore}/20</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Optimization Suggestions */}
      {!meetsTarget && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={suggestion.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                      {suggestion.priority} priority
                    </Badge>
                    <span className="text-xs text-gray-500">+{suggestion.expectedImprovement} points</span>
                  </div>
                  <p className="text-sm font-medium">{suggestion.action}</p>
                  <p className="text-xs text-gray-600">{suggestion.reason}</p>
                </div>
                {onRegenerateSection && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRegenerateSection(suggestion.section, suggestion.reason)}
                    disabled={isOptimizing}
                    className="ml-3 flex items-center gap-1"
                  >
                    {isOptimizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                    Fix
                  </Button>
                )}
              </div>
            ))}

            {/* Auto-Optimize Button */}
            {onRegenerateSection && (
              <div className="pt-2 border-t">
                <Button
                  onClick={() => onRegenerateSection("auto", "Automatically optimize all sections")}
                  disabled={isOptimizing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing Resume...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Auto-Optimize Resume
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Improvements List */}
      {score.improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specific Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
