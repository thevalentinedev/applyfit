"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createJobApplication } from "@/app/actions/create-job-application"
import { Loader2, Plus } from "lucide-react"

export function JobApplicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const result = await createJobApplication(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Job application added successfully!",
        })
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add job application",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Job Application
        </CardTitle>
        <CardDescription>Track a new job application</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" name="company_name" placeholder="e.g. Google" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                name="job_title"
                placeholder="e.g. Software Engineer"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_link">Job Link (Optional)</Label>
            <Input id="job_link" name="job_link" type="url" placeholder="https://..." disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume_url">Resume URL (Optional)</Label>
            <Input
              id="resume_url"
              name="resume_url"
              type="url"
              placeholder="Link to your resume"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="applied" disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
            <Textarea
              id="cover_letter"
              name="cover_letter"
              placeholder="Your cover letter content..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
