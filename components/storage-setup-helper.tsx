"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { ensureStorageBucket } from "@/app/actions/upload-file-to-storage"

export function StorageSetupHelper() {
  const [isChecking, setIsChecking] = useState(false)
  const [setupStatus, setSetupStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleSetupStorage = async () => {
    setIsChecking(true)
    setSetupStatus(null)

    try {
      const result = await ensureStorageBucket()

      if (result.success) {
        setSetupStatus({
          success: true,
          message: "Storage bucket is ready! You can now generate and store resume files.",
        })
      } else {
        setSetupStatus({
          success: false,
          message: result.error || "Failed to set up storage bucket",
        })
      }
    } catch (error) {
      setSetupStatus({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Storage Setup Required
        </CardTitle>
        <CardDescription>Set up file storage to save and download your generated resumes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSetupStorage} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up storage...
            </>
          ) : (
            "Set Up Storage"
          )}
        </Button>

        {setupStatus && (
          <Alert variant={setupStatus.success ? "default" : "destructive"}>
            {setupStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{setupStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>What this does:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Creates a secure storage bucket for your files</li>
            <li>Sets up proper access permissions</li>
            <li>Enables file download functionality</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
