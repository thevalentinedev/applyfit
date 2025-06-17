"use client"

import type React from "react"
import { useState } from "react"

interface UserProfile {
  full_name: string
  email: string
  phone: string
  website: string
  linkedin_url: string
  github_url: string
  professional_summary: string
  education: any[] // Replace 'any' with a more specific type if possible
  professional_experience: any[] // Replace 'any' with a more specific type if possible
  projects_achievements: any[] // Replace 'any' with a more specific type if possible
}

interface UserProfileFormProps {
  userProfile: UserProfile | null
  onSubmit: (data: UserProfile) => void
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ userProfile, onSubmit }) => {
  // Set default values from user profile
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    website: userProfile?.website || "",
    linkedin_url: userProfile?.linkedin_url || "",
    github_url: userProfile?.github_url || "",
    professional_summary: userProfile?.professional_summary || "",
    education: userProfile?.education || [],
    professional_experience: userProfile?.professional_experience || [],
    projects_achievements: userProfile?.projects_achievements || [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="full_name">Full Name:</label>
        <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="phone">Phone:</label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="website">Website:</label>
        <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="linkedin_url">LinkedIn URL:</label>
        <input type="url" id="linkedin_url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="github_url">GitHub URL:</label>
        <input type="url" id="github_url" name="github_url" value={formData.github_url} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="professional_summary">Professional Summary:</label>
        <textarea
          id="professional_summary"
          name="professional_summary"
          value={formData.professional_summary}
          onChange={handleChange}
        />
      </div>

      {/* Education, Experience, Projects - Implement as needed */}

      <button type="submit">Save</button>
    </form>
  )
}

export default UserProfileForm
