"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"
import { JobApplicationsTable } from "@/components/dashboard/job-applications-table"

export default function ApplicationsSection() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/applications/all", { method: "GET" })
      if (res.ok) {
        const data = await res.json()
        console.log("Fetched applications:", data)
        setApplications(data.applications || [])
      } else {
        setApplications([])
        console.error("Failed to fetch applications", res.status)
      }
    } catch (err) {
      setApplications([])
      console.error("Error fetching applications", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Job Applications
      </h2>
      {loading ? (
        <div>Loading applications...</div>
      ) : (
        <JobApplicationsTable
          applications={applications}
          onStatusUpdate={fetchApplications}
          onDelete={fetchApplications}
        />
      )}
    </div>
  )
} 