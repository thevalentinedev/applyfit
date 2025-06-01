"use client"

import type { JobDetails } from "@/app/actions/parse-job"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface JobDetailsPreviewProps {
  jobDetails: JobDetails
  isExpanded: boolean
  onToggleExpand: () => void
  onUpdateJobDetails?: (updatedDetails: JobDetails) => void
}

export function JobDetailsPreview({
  jobDetails,
  isExpanded,
  onToggleExpand,
  onUpdateJobDetails,
}: JobDetailsPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDetails, setEditedDetails] = useState(jobDetails)

  const handleSaveEdits = () => {
    if (onUpdateJobDetails) {
      onUpdateJobDetails(editedDetails)
    }
    setIsEditing(false)
  }

  const handleCancelEdits = () => {
    setEditedDetails(jobDetails)
    setIsEditing(false)
  }

  if (!jobDetails.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-700 font-medium mb-2">Unable to Extract Job Details</h3>
        <p className="text-red-600 mb-4">{jobDetails.error}</p>
        <p className="text-gray-700">Please paste the job description manually below.</p>
      </div>
    )
  }

  const descriptionPreview = isExpanded
    ? jobDetails.description
    : `${jobDetails.description.substring(0, 800)}${jobDetails.description.length > 800 ? "..." : ""}`

  // Check if company name needs manual override
  const needsCompanyOverride = jobDetails.companyName === "Unknown Company"

  return (
    <div className="bg-[#F8FAFC] border border-gray-200 rounded-lg p-6">
      {needsCompanyOverride && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="text-yellow-800 font-medium mb-2">Company Name Not Found</h4>
          <p className="text-yellow-700 text-sm mb-3">
            We couldn't extract the company name from LinkedIn. Please enter it manually:
          </p>
          <div className="flex gap-2">
            <Input
              value={editedDetails.companyName}
              onChange={(e) => setEditedDetails((prev) => ({ ...prev, companyName: e.target.value }))}
              placeholder="Enter company name"
              className="flex-1"
            />
            <Button onClick={handleSaveEdits} size="sm" className="bg-[#3B82F6] hover:bg-blue-600 text-white">
              Update
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
                  <Input
                    value={editedDetails.jobTitle}
                    onChange={(e) => setEditedDetails((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    className="text-lg font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                    <Input
                      value={editedDetails.companyName}
                      onChange={(e) => setEditedDetails((prev) => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <Input
                      value={editedDetails.location}
                      onChange={(e) => setEditedDetails((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveEdits} size="sm" className="bg-[#3B82F6] hover:bg-blue-600 text-white">
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdits} size="sm" variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]">{jobDetails.jobTitle}</h3>
                <p className="text-[#475569] mt-1">
                  <span className={jobDetails.companyName === "Unknown Company" ? "text-yellow-600 font-medium" : ""}>
                    {jobDetails.companyName}
                  </span>
                  {" • "}
                  {jobDetails.location}
                </p>
              </div>
            )}
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-[#3B82F6] hover:text-blue-700 font-medium"
            >
              Edit Details
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Job Description</h4>
          <div
            className={`text-[#1E293B] text-sm whitespace-pre-line ${
              isExpanded ? "max-h-[600px] overflow-y-auto" : ""
            }`}
          >
            {descriptionPreview}
          </div>
          {jobDetails.description.length > 800 && (
            <button onClick={onToggleExpand} className="text-sm text-[#3B82F6] hover:text-blue-700 font-medium mt-2">
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
