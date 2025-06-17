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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const statusOptions = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { value: "interviewed", label: "Interviewed", color: "bg-yellow-100 text-yellow-800" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-800" },
  { value: "ghosted", label: "Ghosted", color: "bg-gray-100 text-gray-800" },
]

interface ApplicationStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  currentStatus: string
}

export function ApplicationStatusDialog({
  open,
  onOpenChange,
  applicationId,
  currentStatus,
}: ApplicationStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      onOpenChange(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/applications/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: selectedStatus,
        }),
      })

      if (response.ok) {
        router.refresh()
        onOpenChange(false)
      } else {
        console.error("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>Change the status of this job application.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Status</label>
            <div className="mt-1">
              <Badge className={statusOptions.find((s) => s.value === currentStatus)?.color}>
                {statusOptions.find((s) => s.value === currentStatus)?.label}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">New Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={status.color} variant="outline">
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
