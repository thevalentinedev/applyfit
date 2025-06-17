"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, RefreshCw, Trophy, Target, Zap } from "lucide-react"
import type { ATSScoreResult } from "@/lib/ats-scorer"

interface ATSScoreFeedbackProps {
  score: ATSScoreResult
  onRegenerateSection: (sectionType: string, focus: string) => Promise<void>
  isRegenerating: boolean
  regeneratingSection?: string
  onAutoOptimize: () => Promise<void>
  isAutoOptimizing: boolean
}

export function ATSScoreFeedback({
  score,
  onRegenerateSection,
  isRegenerating,
  regeneratingSection,
  onAutoOptimize,
  isAutoOptimizing,
}: ATSScoreFeedbackProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200"
    if (score >= 75) return "bg-yellow-50 border-yellow-200"
    if (score >= 60) return "bg-orange-50 border-orange-200"
    return "bg-red-50 border-red-200"
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-yellow-500"
    if (score >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  const isTargetMet = score.score >= 90

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <Card className={`${getScoreBg(score.score)} border-2`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {isTargetMet ? (
                <Trophy className="h-6 w-6 text-green-600" />
              ) : (
                <Target className="h-6 w-6 text-orange-600" />
              )}
              <span>ATS Compatibility Score</span>
            </CardTitle>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>{score.score}/100</div>
              <Badge variant={isTargetMet ? "default" : "destructive"} className="mt-1">
                {isTargetMet ? "ATS Ready!" : "Needs Optimization"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>ATS Compatibility</span>
                <span className="font-medium">{score.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(score.score)}`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
            </div>

            {isTargetMet ? (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">🥇 This resume now scores {score.score}/100 — ready to apply!</span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  Your resume is optimized for ATS systems and should pass initial screening filters.
                </p>
              </div>
            ) : (
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Your resume scored {score.score}/100 for this role</span>
                </div>
                <p className="text-orange-700 text-sm mt-2">
                  Let's optimize it to reach 90+ for better ATS compatibility.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(score.breakdown).map(([category, categoryScore]) => {
              const categoryName = category.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
              const isGood = categoryScore >= 16 // 80% of 20 points

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{categoryName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isGood ? "text-green-600" : "text-red-600"}`}>
                        {categoryScore}/20
                      </span>
                      {isGood ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <Progress value={(categoryScore / 20) * 100} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feedback & Actions */}
      {!isTargetMet && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* What Worked */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                What Worked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {score.feedback
                  .filter(
                    (item) =>
                      item.includes("✅") ||
                      item.toLowerCase().includes("good") ||
                      item.toLowerCase().includes("strong"),
                  )
                  .map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-800">{item.replace("✅", "").trim()}</span>
                    </li>
                  ))}
                {score.feedback.filter((item) => item.includes("✅") || item.toLowerCase().includes("good")).length ===
                  0 && <li className="text-sm text-gray-500">Analyzing strengths...</li>}
              </ul>
            </CardContent>
          </Card>

          {/* What Needs Work */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Needs Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {score.feedback
                  .filter(
                    (item) =>
                      item.includes("⚠️") ||
                      item.toLowerCase().includes("missing") ||
                      item.toLowerCase().includes("weak"),
                  )
                  .map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-red-800">{item.replace("⚠️", "").trim()}</span>
                    </li>
                  ))}
                {score.improvements.slice(0, 3).map((improvement, index) => (
                  <li key={`imp-${index}`} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-orange-800">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      {!isTargetMet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Optimization Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Auto-Optimize Button */}
              <Button
                onClick={onAutoOptimize}
                disabled={isAutoOptimizing || isRegenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isAutoOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Auto-Optimizing Resume...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Auto-Optimize to 90+ Score
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">or optimize individual sections:</div>

              {/* Individual Section Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => onRegenerateSection("summary", "keyword alignment and ATS optimization")}
                  disabled={isRegenerating || isAutoOptimizing}
                  className="flex items-center gap-2"
                >
                  {isRegenerating && regeneratingSection === "summary" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Regenerate Summary
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onRegenerateSection("skills", "job description alignment and categorization")}
                  disabled={isRegenerating || isAutoOptimizing}
                  className="flex items-center gap-2"
                >
                  {isRegenerating && regeneratingSection === "skills" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Improve Skills Alignment
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onRegenerateSection("experience", "action verb variety and quantified achievements")}
                  disabled={isRegenerating || isAutoOptimizing}
                  className="flex items-center gap-2"
                >
                  {isRegenerating && regeneratingSection === "experience" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Fix Experience Bullets
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
