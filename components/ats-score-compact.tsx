"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, AlertTriangle, Target, Trophy, Zap, RefreshCw, TrendingUp } from "lucide-react"

export interface ATSScoreResult {
  score: number
  targetMet: boolean
  breakdown: {
    keywordMatch: number
    experienceRelevance: number
    formatCompatibility: number
    sectionCompleteness: number
    clarityUniqueness: number
  }
  feedback: string[]
  improvements: string[]
}

interface ATSScoreCompactProps {
  score: ATSScoreResult
  suggestions: string[]
  onRegenerateSection: (section: string, reason: string) => void
  isOptimizing: boolean
}

export function ATSScoreCompact({ score, suggestions, onRegenerateSection, isOptimizing }: ATSScoreCompactProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Update the score color thresholds to be more realistic
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600" // Excellent (rare)
    if (score >= 65) return "text-yellow-600" // Good
    if (score >= 50) return "text-orange-600" // Average
    return "text-red-600" // Poor
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200"
    if (score >= 65) return "bg-yellow-50 border-yellow-200"
    if (score >= 50) return "bg-orange-50 border-orange-200"
    return "bg-red-50 border-red-200"
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-yellow-500"
    if (score >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  // Update target score to be more realistic
  const isTargetMet = score.score >= 75 // Changed from 90 to 75

  // Extract what worked and what needs improvement - Updated logic
  const whatWorked = score.feedback.filter(
    (item) =>
      item.toLowerCase().includes("strong") ||
      item.toLowerCase().includes("good") ||
      item.toLowerCase().includes("excellent") ||
      item.toLowerCase().includes("well") ||
      item.toLowerCase().includes("clear") ||
      item.toLowerCase().includes("relevant") ||
      item.toLowerCase().includes("appropriate") ||
      item.toLowerCase().includes("structured") ||
      item.toLowerCase().includes("consistent"),
  )

  // If no positive feedback found, create some based on score
  const finalWhatWorked =
    whatWorked.length > 0
      ? whatWorked
      : [
          score.breakdown.formatCompatibility >= 15 ? "Resume has clean, ATS-friendly formatting" : null,
          score.breakdown.sectionCompleteness >= 15 ? "All required sections are present" : null,
          score.breakdown.keywordMatch >= 12 ? "Some relevant keywords are included" : null,
        ].filter(Boolean)

  const needsImprovement = [
    ...score.feedback.filter(
      (item) =>
        item.toLowerCase().includes("missing") ||
        item.toLowerCase().includes("weak") ||
        item.toLowerCase().includes("improve") ||
        item.toLowerCase().includes("lacking") ||
        item.toLowerCase().includes("generic") ||
        item.toLowerCase().includes("limited") ||
        item.toLowerCase().includes("insufficient"),
    ),
    ...score.improvements.slice(0, 3),
  ]

  const handleAutoOptimize = () => {
    // Auto-optimize by regenerating multiple sections
    onRegenerateSection("auto", "comprehensive ATS optimization")
  }

  return (
    <>
      {/* Compact ATS Score Display */}
      <Card className={`${getScoreBg(score.score)} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isTargetMet ? (
                <Trophy className="h-6 w-6 text-green-600" />
              ) : (
                <Target className="h-6 w-6 text-orange-600" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">ATS Score:</span>
                  <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>{score.score}/100</span>
                  <Badge variant={isTargetMet ? "default" : "destructive"} className="text-xs">
                    {isTargetMet ? "ATS Ready!" : "Needs Optimization"}
                  </Badge>
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score.score)}`}
                    style={{ width: `${score.score}%` }}
                  />
                </div>
              </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    ATS Compatibility Analysis
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className={`${getScoreBg(score.score)} border-2 rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {isTargetMet ? (
                          <Trophy className="h-6 w-6 text-green-600" />
                        ) : (
                          <Target className="h-6 w-6 text-orange-600" />
                        )}
                        <span className="text-lg font-semibold">Overall ATS Score</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>{score.score}/100</div>
                        <Badge variant={isTargetMet ? "default" : "destructive"}>
                          {isTargetMet ? "ATS Ready!" : "Needs Optimization"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={score.score} className="h-3" />
                  </div>

                  {/* Score Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(score.breakdown).map(([category, categoryScore]) => {
                        const categoryName = category
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())
                        const isGood = categoryScore >= 16 // 80% of 20 points

                        return (
                          <div key={category} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
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
                  </div>

                  {/* What Worked & Needs Improvement */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* What Worked */}
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <h3 className="flex items-center gap-2 text-green-700 font-semibold mb-4">
                          <CheckCircle className="h-5 w-5" />
                          What Worked
                        </h3>
                        {finalWhatWorked.length > 0 ? (
                          <ul className="space-y-2">
                            {finalWhatWorked.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-green-800">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-green-700 text-sm">Resume shows basic structure and formatting</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Needs Improvement */}
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <h3 className="flex items-center gap-2 text-red-700 font-semibold mb-4">
                          <AlertTriangle className="h-5 w-5" />
                          Needs Improvement
                        </h3>
                        {needsImprovement.length > 0 ? (
                          <ul className="space-y-2">
                            {needsImprovement.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-red-800">{item.replace("⚠️", "").trim()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="space-y-2 text-sm text-red-700">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span>Unable to generate specific improvements at this time</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span>Please regenerate the resume and try scoring again</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span>Consider reviewing job description for key requirements</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Optimization Actions */}
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Optimization Actions
                    </h3>

                    <div className="space-y-4">
                      {/* Auto-Optimize Button */}
                      <Button
                        onClick={handleAutoOptimize}
                        disabled={isOptimizing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base"
                        size="lg"
                      >
                        {isOptimizing ? (
                          <>
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Auto-Optimizing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-2" />
                            Auto-Optimize to 90+ Score
                          </>
                        )}
                      </Button>

                      <div className="text-center text-gray-500 text-sm">or optimize individual sections:</div>

                      {/* Individual Section Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => onRegenerateSection("summary", "keyword alignment and ATS optimization")}
                          disabled={isOptimizing}
                          className="flex items-center gap-2 py-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regenerate Summary
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => onRegenerateSection("skills", "job description alignment and categorization")}
                          disabled={isOptimizing}
                          className="flex items-center gap-2 py-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Improve Skills Alignment
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            onRegenerateSection("experience", "action verb variety and quantified achievements")
                          }
                          disabled={isOptimizing}
                          className="flex items-center gap-2 py-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Fix Experience Bullets
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
