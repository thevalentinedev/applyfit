import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Building } from "lucide-react"
import { getJobApplications } from "@/lib/dal"

const statusColors = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  interviewing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  offered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  accepted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export async function JobApplicationsList() {
  const applications = await getJobApplications()

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
          <p className="text-muted-foreground text-center">
            Start tracking your job applications by adding your first one above.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-heading font-bold">Your Applications</h2>
      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {app.job_title}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium">{app.company_name}</CardDescription>
                </div>
                <Badge className={statusColors[app.status as keyof typeof statusColors]}>{app.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Applied: {new Date(app.date_applied).toLocaleDateString()}
                  </div>
                </div>
                {app.job_link && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={app.job_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
