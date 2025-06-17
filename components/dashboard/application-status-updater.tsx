"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateApplicationStatus } from "@/app/actions/store-resume"
import { Loader2 } from "lucide-react"

interface ApplicationStatusUpdaterProps {
  applicationId: string
  currentStatus: string
  currentNotes?: string
}

export function ApplicationStatusUpdater({
  applicationId,
  currentStatus,
  currentNotes,
}: ApplicationStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    if (status === currentStatus && notes === currentNotes) {
      toast({
        title: "No changes",
        description: "No changes were made to update.",
        variant: "default",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await updateApplicationStatus(applicationId, status, notes)

      if (result.success) {
        toast({
          title: "Updated successfully",
          description: "Application status has been updated.",
        })
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update application status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="ghosted">Ghosted</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this application..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button onClick={handleUpdate} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Application"
        )}
      </Button>
    </div>
  )
}
