"use client"

import { getApplicationById, verifySession } from "@/lib/dal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Building,
  Calendar,
  ExternalLink,
  FileText,
  Clock,
  Download,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ApplicationStatusUpdater } from "@/components/dashboard/application-status-updater"
import { useState } from "react"

const statusColors = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  interviewed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  ghosted: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const session = await verifySession()
  const application = await getApplicationById(params.id)

  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!application) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-bold">{application.job_title}</h1>
              <p className="text-muted-foreground">{application.company_name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Application Details
                  </CardTitle>
                  <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Applied:</span>
                      <span>{new Date(application.date_applied).toLocaleDateString()}</span>
                    </div>

                    {application.resume_generated_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Resume Generated:</span>
                        <span>{new Date(application.resume_generated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Last Updated:</span>
                      <span>{new Date(application.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {application.job_link && (
                  <div className="pt-2">
                    <Button variant="outline" asChild>
                      <a href={application.job_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Original Job Posting
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
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{application.job_description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Notes */}
            {application.application_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{application.application_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manage Application</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationStatusUpdater
                  applicationId={application.id}
                  currentStatus={application.status}
                  currentNotes={application.application_notes}
                />
              </CardContent>
            </Card>

            {/* Resume Information */}
            {application.resume_generated_at && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="default" size="sm" className="w-full" asChild>
                    <Link href={`/?jobUrl=${encodeURIComponent(application.job_link || "")}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate New Resume
                    </Link>
                  </Button>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Generated:</span>
                      <br />
                      <span className="text-muted-foreground">
                        {new Date(application.resume_generated_at).toLocaleString()}
                      </span>
                    </div>

                    {application.resume_version && (
                      <div>
                        <span className="font-medium">Version:</span>
                        <br />
                        <Badge variant="outline">v{application.resume_version}</Badge>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setShowStatusDialog(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Status
                    </Button>

                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>

                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Cover Letter
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Created</span>
                    <span className="text-muted-foreground">
                      {new Date(application.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Last Updated</span>
                    <span className="text-muted-foreground">
                      {new Date(application.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {application.resume_generated_at && (
                    <div className="flex items-center justify-between">
                      <span>Resume Generated</span>
                      <span className="text-muted-foreground">
                        {new Date(application.resume_generated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
