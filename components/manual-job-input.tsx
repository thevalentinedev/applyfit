"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { JobDetails } from "@/app/actions/parse-job"

interface ManualJobInputProps {
  onSubmit: (jobDetails: JobDetails) => void
  initialData?: JobDetails | null
}

export function ManualJobInput({ onSubmit, initialData }: ManualJobInputProps) {
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || "")
  const [companyName, setCompanyName] = useState(initialData?.companyName || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [description, setDescription] = useState(initialData?.description || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      jobTitle,
      companyName,
      location,
      description,
      success: true,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="job-title" className="block text-sm font-medium text-[#1E293B] mb-1">
          Job Title
        </label>
        <Input
          id="job-title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Frontend Developer"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-[#1E293B] mb-1">
            Company Name
          </label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Inc."
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-[#1E293B] mb-1">
            Location
          </label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, New York, NY"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[#1E293B] mb-1">
          Job Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="min-h-[200px]"
          required
        />
      </div>

      <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white">
        Save Job Details
      </Button>
    </form>
  )
}
