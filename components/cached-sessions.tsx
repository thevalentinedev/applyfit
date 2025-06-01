"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Clock, Building, MapPin, Zap } from "lucide-react"
import { CacheManager, type CachedSession } from "@/lib/cache-manager"
import { useToast } from "@/hooks/use-toast"

interface CachedSessionsProps {
  currentJobUrl?: string
  onLoadSession: (session: CachedSession) => void
  onClearCache: () => void
}

export function CachedSessions({ currentJobUrl, onLoadSession, onClearCache }: CachedSessionsProps) {
  const [sessions, setSessions] = useState<CachedSession[]>([])
  const [showAll, setShowAll] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = () => {
    const cachedSessions = CacheManager.getSessions()
    setSessions(cachedSessions)
  }

  const handleDeleteSession = (sessionId: string) => {
    CacheManager.deleteSession(sessionId)
    loadSessions()
    toast({
      title: "Session deleted",
      description: "Cached session has been removed.",
      variant: "success",
    })
  }

  const handleClearAll = () => {
    CacheManager.clearAllSessions()
    setSessions([])
    onClearCache()
    toast({
      title: "Cache cleared",
      description: "All cached sessions have been removed.",
      variant: "success",
    })
  }

  const handleLoadSession = (session: CachedSession) => {
    onLoadSession(session)
    toast({
      title: "Session loaded",
      description: `Loaded previous work for ${session.jobDetails.companyName}.`,
      variant: "success",
    })
  }

  if (sessions.length === 0) {
    return null
  }

  // Find matching session for current job URL
  const matchingSession = currentJobUrl ? sessions.find((s) => s.jobUrl === currentJobUrl) : null
  const otherSessions = sessions.filter((s) => s.jobUrl !== currentJobUrl)
  const displaySessions = showAll ? otherSessions : otherSessions.slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Matching Session Alert */}
      {matchingSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800 text-lg">Previous Work Found!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-blue-700 text-sm mb-2">
                  You've already generated content for this job. Load your previous work to save time and API costs.
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-600">
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {matchingSession.jobDetails.companyName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {CacheManager.formatTimestamp(matchingSession.timestamp)}
                  </div>
                  {matchingSession.useGpt4 && (
                    <Badge variant="secondary" className="text-xs">
                      GPT-4
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleLoadSession(matchingSession)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Load Previous Work
                </Button>
                <Button
                  onClick={() => handleDeleteSession(matchingSession.id)}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300"
                >
                  Start Fresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 text-lg">Recent Sessions</CardTitle>
              <Button onClick={handleClearAll} variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{session.jobDetails.jobTitle}</h4>
                      {session.useGpt4 && (
                        <Badge variant="secondary" className="text-xs">
                          GPT-4
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {session.jobDetails.companyName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.jobDetails.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {CacheManager.formatTimestamp(session.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => handleLoadSession(session)} variant="outline" size="sm" className="text-xs">
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDeleteSession(session.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {otherSessions.length > 3 && !showAll && (
                <Button onClick={() => setShowAll(true)} variant="ghost" size="sm" className="w-full text-gray-500">
                  Show {otherSessions.length - 3} more sessions
                </Button>
              )}

              {showAll && otherSessions.length > 3 && (
                <Button onClick={() => setShowAll(false)} variant="ghost" size="sm" className="w-full text-gray-500">
                  Show less
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
