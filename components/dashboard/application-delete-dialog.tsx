"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApplicationDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  jobTitle: string
  companyName: string
}

export function ApplicationDeleteDialog({
  open,
  onOpenChange,
  applicationId,
  jobTitle,
  companyName,
}: ApplicationDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/applications/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        console.error("Failed to delete application")
      }
    } catch (error) {
      console.error("Error deleting application:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Application
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this job application? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm">
            <div className="font-medium text-red-800">{jobTitle}</div>
            <div className="text-red-600">{companyName}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
