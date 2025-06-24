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
import { ApplicationDetailClient } from "@/components/dashboard/application-detail-client"

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

  if (!application) {
    notFound()
  }

  return (
    <ApplicationDetailClient 
      application={application}
      statusColors={statusColors}
    />
  )
}
