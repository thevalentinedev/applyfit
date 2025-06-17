"use client"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import {
  Building2,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Zap,
  Loader2,
  Search,
} from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

// Safe date formatting function
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch (error) {
    return "Invalid Date"
  }
}

// Download resume function
async function downloadResume(application: JobApplication) {
  if (!application.resume_file_path) {
    throw new Error("No resume available for download")
  }

  try {
    // Use the blob URL directly from the database
    const blobUrl = application.resume_file_path

    console.log("Attempting to download from URL:", blobUrl)

    const response = await fetch(blobUrl)
    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)

    if (!response.ok) {
      console.error("Response not ok:", response.statusText)
      throw new Error(`Failed to download resume: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    console.log("Blob size:", blob.size)
    console.log("Blob type:", blob.type)

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = `${application.company_name}_${application.job_title}_Resume.${blob.type.includes("pdf") ? "pdf" : "docx"}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error("Download error:", error)
    throw new Error(`Failed to download resume file: ${error.message}`)
  }
}

// Download cover letter function
async function downloadCoverLetter(application: JobApplication) {
  if (!application.cover_letter_file_path) {
    throw new Error("No cover letter available for download")
  }

  try {
    // Use the blob URL directly from the database
    const blobUrl = application.cover_letter_file_path

    console.log("Attempting to download cover letter from URL:", blobUrl)

    const response = await fetch(blobUrl)
    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)

    if (!response.ok) {
      console.error("Response not ok:", response.statusText)
      throw new Error(`Failed to download cover letter: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    console.log("Blob size:", blob.size)
    console.log("Blob type:", blob.type)

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = `${application.company_name}_${application.job_title}_Cover_Letter.${blob.type.includes("pdf") ? "pdf" : "docx"}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error("Download error:", error)
    throw new Error(`Failed to download cover letter file: ${error.message}`)
  }
}

interface JobApplication {
  id: string
  company_name: string
  job_title: string
  job_link?: string
  location?: string
  salary_range?: string
  status: string
  date_applied: string
  created_at: string
  updated_at: string
  job_description?: string
  resume_url?: string
  resume_generated_at?: string
  resume_file_path?: string
  cover_letter?: string
  cover_letter_file_path?: string
  application_notes?: string
  resume_content?: any
}

interface JobApplicationsTableProps {
  applications: JobApplication[]
  onStatusUpdate?: () => void
  onDelete?: () => void
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800 border-blue-200",
  interviewed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  offer: "bg-green-100 text-green-800 border-green-200",
  ghosted: "bg-gray-100 text-gray-800 border-gray-200",
} as const

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "interviewed", label: "Interviewed" },
  { value: "offer", label: "Offer" },
  { value: "ghosted", label: "Ghosted" },
]

// Update application status action
async function updateApplicationStatus(applicationId: string, newStatus: string) {
  const response = await fetch("/api/applications/update-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicationId,
      status: newStatus,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to update application status")
  }

  return response.json()
}

// Delete application action
async function deleteApplication(applicationId: string) {
  const response = await fetch("/api/applications/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicationId,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to delete application")
  }

  return response.json()
}

function EditStatusDialog({
  application,
  onStatusUpdate,
}: {
  application: JobApplication
  onStatusUpdate?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(application.status)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleStatusUpdate = async () => {
    if (newStatus === application.status) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)

    try {
      await updateApplicationStatus(application.id, newStatus)
      toast({
        title: "Status updated",
        description: `Application status changed to ${statusOptions.find((s) => s.value === newStatus)?.label}`,
      })
      setIsOpen(false)
      onStatusUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>
            Update the status for {application.company_name} - {application.job_title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeleteApplicationDialog({
  application,
  onDelete,
}: {
  application: JobApplication
  onDelete?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      await deleteApplication(application.id)
      toast({
        title: "Application deleted",
        description: `${application.company_name} - ${application.job_title} has been deleted`,
      })
      onDelete?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Application</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the application for {application.company_name} - {application.job_title}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Application"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ApplicationModal({ application }: { application: JobApplication }) {
  const { toast } = useToast()
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {application.company_name}
            </DialogTitle>
            <DialogDescription className="text-lg mt-1">{application.job_title}</DialogDescription>
          </div>
          <Badge
            variant="outline"
            className={statusColors[application.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
          >
            {statusOptions.find((s) => s.value === application.status)?.label || application.status}
          </Badge>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Applied</p>
                    <p className="text-sm text-muted-foreground">{formatDate(application.date_applied)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">{formatDate(application.updated_at)}</p>
                  </div>
                </div>
              </div>

              {application.resume_generated_at && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Zap className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Resume Generated</p>
                    <p className="text-sm text-green-600">{formatDate(application.resume_generated_at)}</p>
                  </div>
                </div>
              )}

              {application.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{application.location}</span>
                </div>
              )}

              {application.salary_range && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{application.salary_range}</span>
                </div>
              )}

              {application.job_link && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={application.job_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job Posting
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          {application.job_description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-60 overflow-y-auto">
                    {application.job_description}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cover Letter */}
          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{application.cover_letter}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {application.application_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{application.application_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={async () => {
                    if (!application.resume_file_path) {
                      toast({
                        title: "No resume available",
                        description: "This application doesn't have a generated resume to download.",
                        variant: "destructive",
                      })
                      return
                    }

                    try {
                      await downloadResume(application)
                      toast({
                        title: "Resume downloaded",
                        description: "Resume file has been downloaded successfully.",
                      })
                    } catch (error) {
                      console.error("Download button error:", error)
                      toast({
                        title: "Download failed",
                        description: error.message || "Failed to download the resume file.",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={!application.resume_file_path}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={async () => {
                    if (!application.cover_letter_file_path) {
                      toast({
                        title: "No cover letter available",
                        description: "This application doesn't have a generated cover letter to download.",
                        variant: "destructive",
                      })
                      return
                    }

                    try {
                      await downloadCoverLetter(application)
                      toast({
                        title: "Cover letter downloaded",
                        description: "Cover letter file has been downloaded successfully.",
                      })
                    } catch (error) {
                      console.error("Download button error:", error)
                      toast({
                        title: "Download failed",
                        description: error.message || "Failed to download the cover letter file.",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={!application.cover_letter_file_path}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Cover Letter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Application ID */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono text-muted-foreground">{application.id.slice(0, 8)}...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DialogContent>
  )
}

export function JobApplicationsTable({ applications, onStatusUpdate, onDelete }: JobApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Handle individual checkbox selection
  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications((prev) => [...prev, applicationId])
    } else {
      setSelectedApplications((prev) => prev.filter((id) => id !== applicationId))
    }
  }

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(filteredApplications.map((app) => app.id))
    } else {
      setSelectedApplications([])
    }
  }

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedApplications.length === 0) return

    setIsDeleting(true)
    try {
      // Delete all selected applications
      await Promise.all(selectedApplications.map((id) => deleteApplication(id)))

      toast({
        title: "Applications deleted",
        description: `${selectedApplications.length} application${selectedApplications.length !== 1 ? "s" : ""} deleted successfully`,
      })

      setSelectedApplications([])
      onDelete?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some applications",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter applications based on search term
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      app.company_name.toLowerCase().includes(searchLower) ||
      app.job_title.toLowerCase().includes(searchLower) ||
      app.location?.toLowerCase().includes(searchLower) ||
      app.status.toLowerCase().includes(searchLower)
    )
  })

  if (!applications || applications.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Generate your first resume to automatically start tracking your job applications.
          </p>
          <Button asChild>
            <Link href="/">Generate Resume</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Job Applications</h2>
          <p className="text-muted-foreground">
            {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? "s" : ""}
            {searchTerm && " matching your search"}
            {selectedApplications.length > 0 && ` • ${selectedApplications.length} selected`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {selectedApplications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete {selectedApplications.length}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Applications</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedApplications.length} application
                    {selectedApplications.length !== 1 ? "s" : ""}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                    Delete Applications
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button>Generate New Resume</Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedApplications.length === filteredApplications.length && filteredApplications.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all applications"
                />
              </TableHead>
              <TableHead className="w-[200px]">Company</TableHead>
              <TableHead className="w-[250px]">Job Title</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[130px]">Date Applied</TableHead>
              <TableHead className="w-[100px]">Resume</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedApplications.includes(application.id)}
                    onCheckedChange={(checked) => handleSelectApplication(application.id, checked as boolean)}
                    aria-label={`Select ${application.company_name} application`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{application.company_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{application.job_title}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      statusColors[application.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {statusOptions.find((s) => s.value === application.status)?.label || application.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDate(application.date_applied)}</span>
                </TableCell>
                <TableCell>
                  {application.resume_generated_at ? (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Generated</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <ApplicationModal application={application} />
                    </Dialog>
                    <EditStatusDialog application={application} onStatusUpdate={onStatusUpdate} />
                    <DeleteApplicationDialog application={application} onDelete={onDelete} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
