import type React from "react"

interface CoverLetterPreviewProps {
  coverLetterContent: string
  userProfile: any
}

const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({ coverLetterContent, userProfile }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {/* Dynamic header for cover letter */}
      <div className="mb-6">
        <div className="font-bold text-lg">{userProfile?.full_name || "Your Name"}</div>
        <div className="text-sm text-gray-600">{userProfile?.email || "your.email@example.com"}</div>
        <div className="text-sm text-gray-600">{userProfile?.phone || "Your Phone"}</div>
        {userProfile?.website && <div className="text-sm text-gray-600">{userProfile.website}</div>}
      </div>

      <div dangerouslySetInnerHTML={{ __html: coverLetterContent }} />
    </div>
  )
}

export default CoverLetterPreview
