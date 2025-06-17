import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Building, FileText, Eye, Clock, XCircle, MessageSquare, Gift } from "lucide-react"
import { getJobApplicationsWithResumes } from "@/lib/dal"
import Link from "next/link"

const statusColors = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  interviewed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  ghosted: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

const statusIcons = {
  applied: Clock,
  interviewed: MessageSquare,
  rejected: XCircle,
  ghosted: Clock,
  offer: Gift,
}

export async function EnhancedJobApplicationsList() {
  const applications = await getJobApplicationsWithResumes()

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
          <p className="text-muted-foreground text-center">
            Generate your first resume to automatically track your job applications.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Your Applications</h2>
        <Badge variant="outline" className="text-sm">
          {applications.length} Total
        </Badge>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => {
          const status = app.status || "applied"
          const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Clock
          const hasResume = app.resume_generated_at || app.resume_file_path || app.resume_url

          return (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building className="h-5 w-5" />
                      {app.job_title}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-foreground">
                      {app.company_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[status as keyof typeof statusColors]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Application Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Applied: {app.date_applied ? new Date(app.date_applied).toLocaleDateString() : "Not specified"}
                  </div>

                  {hasResume && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Resume:{" "}
                      {app.resume_generated_at ? new Date(app.resume_generated_at).toLocaleDateString() : "Generated"}
                    </div>
                  )}
                </div>

                {/* Job Description Preview */}
                {app.job_description && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {app.job_description.substring(0, 150)}...
                    </p>
                  </div>
                )}

                {/* Application Notes */}
                {app.application_notes && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Notes:</strong> {app.application_notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {app.job_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={app.job_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Job
                        </a>
                      </Button>
                    )}

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/applications/${app.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Link>
                    </Button>
                  </div>

                  {hasResume && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Resume Generated
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
