"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { checkStorageBucket } from "@/app/actions/upload-file-to-storage"

export function StorageStatus() {
  const [storageStatus, setStorageStatus] = useState<{
    exists: boolean
    error?: string
    loading: boolean
  }>({ exists: false, loading: true })

  const checkStorage = async () => {
    setStorageStatus({ exists: false, loading: true })
    const result = await checkStorageBucket()
    setStorageStatus({
      exists: result.exists,
      error: result.error,
      loading: false,
    })
  }

  useEffect(() => {
    checkStorage()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {storageStatus.loading ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : storageStatus.exists ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Storage Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {storageStatus.loading ? (
          <p>Checking storage bucket...</p>
        ) : storageStatus.exists ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Storage bucket is properly configured. Files will be saved to cloud storage.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Storage bucket not found. Files will be downloaded locally only.
              {storageStatus.error && (
                <div className="mt-2 text-sm">
                  <strong>Error:</strong> {storageStatus.error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button onClick={checkStorage} variant="outline" size="sm">
            Refresh Status
          </Button>

          {!storageStatus.exists && (
            <div className="text-sm text-muted-foreground">
              <p>To enable cloud storage:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Run the database setup script</li>
                <li>Or create the 'resumes' bucket in Supabase dashboard</li>
                <li>Refresh this status</li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
