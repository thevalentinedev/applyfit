// Import from mock DAL for v0 preview environment
import { verifySession, getUserProfile, getJobApplicationStats, getJobApplications } from "@/lib/dal"
import { JobApplicationsTable } from "@/components/dashboard/job-applications-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Settings,
  TrendingUp,
  User,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

async function DashboardStats() {
  const stats = await getJobApplicationStats()

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: FileText,
      description: "All job applications",
      color: "text-blue-600",
    },
    {
      title: "Applied",
      value: stats.applied,
      icon: Clock,
      description: "Awaiting response",
      color: "text-yellow-600",
    },
    {
      title: "Interviews",
      value: stats.interviewed,
      icon: MessageSquare,
      description: "In interview process",
      color: "text-green-600",
    },
    {
      title: "Offers",
      value: stats.offer,
      icon: CheckCircle2,
      description: "Job offers received",
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function ProfileSummary() {
  const profile = await getUserProfile()

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {profile.full_name || "Complete Your Profile"}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {profile.location && (
                <>
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </>
              )}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/profile">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {profile.bio ? (
          <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
        ) : (
          <p className="text-sm text-muted-foreground mb-4 italic">Add a bio to tell employers about yourself.</p>
        )}

        <div className="space-y-3">
          {profile.experience_level && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="capitalize">
                {profile.experience_level.replace("_", " ")} Level
              </Badge>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {profile.salary_range_min && profile.salary_range_max && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                ${profile.salary_range_min.toLocaleString()} - ${profile.salary_range_max.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const session = await verifySession()

  // Redirect to login if not authenticated
  if (!session.isAuth || !session.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to sign in to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const applications = await getJobApplications()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div>
            <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Application Overview
            </h2>
            <Suspense fallback={<div>Loading stats...</div>}>
              <DashboardStats />
            </Suspense>
          </div>

          {/* Applications Table */}
          <div>
            <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Applications
            </h2>
            <JobApplicationsTable applications={applications || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
