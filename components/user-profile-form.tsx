"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { UserProfile } from "@/app/actions/generate-resume"

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void
  isLoading?: boolean
}

export function UserProfileForm({ onSubmit, isLoading = false }: UserProfileFormProps) {
  // Pre-populate with Valentine's information from the resume template
  const [profile, setProfile] = useState<UserProfile>({
    name: "Valentine Ohalebo",
    email: "hello@valentine.dev",
    phone: "+1 647 282 8563", // You can update this with your actual phone
    location: "Waterloo, ON",
    portfolio: "https://valentine.dev",
    linkedin: "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
    github: "https://github.com/thevalentinedev",
    education: "Ontario College Diploma, Computer Programming - 2025, Conestoga College - Waterloo, ON",
    currentRole: "Full-Stack Developer & Creator",
    experience: `GeoEvent (Jan 2024 - Present) - Remote
• Developed and maintained event management platform using React, Next.js, and Node.js
• Implemented real-time features and optimized database performance
• Collaborated with cross-functional teams to deliver user-centric solutions

Naija Jollof (Feb 2024 - May 2025) - Remote  
• Built responsive web application for Nigerian food delivery service
• Focused on SEO optimization and accessibility improvements
• Enhanced user experience through modern UI/UX design principles`,
    projects: `ImageMark  - Creator & Developer
• Developed watermarking application with 10k+ operations processed
• Implemented smart positioning algorithms using Canvas API
• Built with React, TypeScript, and modern web technologies

GeoEvent Platform (geoevent.ca)
• Full-stack event management solution
• Real-time updates and interactive features
• Modern tech stack with focus on performance

Naija Jollof Website (naijajollofw.ca)
• E-commerce platform for food delivery
• SEO-optimized with accessibility features
• Responsive design for mobile and desktop`,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(profile)
  }

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 font-medium mb-2">Pre-filled with Your Information</h3>
        <p className="text-blue-700 text-sm">
          Your profile has been pre-populated with information from your resume template. You can edit any fields if
          needed before generating your tailored resume.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1E293B] mb-1">
              Full Name *
            </label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Valentine Ohalebo"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1E293B] mb-1">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="hello@valentine.dev"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#1E293B] mb-1">
              Phone Number *
            </label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 (519) 123-4567"
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[#1E293B] mb-1">
              Location *
            </label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Waterloo, ON"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="portfolio" className="block text-sm font-medium text-[#1E293B] mb-1">
              Portfolio Website
            </label>
            <Input
              id="portfolio"
              value={profile.portfolio}
              onChange={(e) => handleChange("portfolio", e.target.value)}
              placeholder="https://valentine.dev"
            />
          </div>
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-[#1E293B] mb-1">
              LinkedIn Profile
            </label>
            <Input
              id="linkedin"
              value={profile.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/valentine-ohalebo-51bb37221/"
            />
          </div>
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-[#1E293B] mb-1">
              GitHub Profile
            </label>
            <Input
              id="github"
              value={profile.github}
              onChange={(e) => handleChange("github", e.target.value)}
              placeholder="https://github.com/thevalentinedev"
            />
          </div>
        </div>

        <div>
          <label htmlFor="education" className="block text-sm font-medium text-[#1E293B] mb-1">
            Education *
          </label>
          <Input
            id="education"
            value={profile.education}
            onChange={(e) => handleChange("education", e.target.value)}
            placeholder="Ontario College Diploma, Computer Programming - 2025, Conestoga College"
            required
          />
        </div>

        <div>
          <label htmlFor="currentRole" className="block text-sm font-medium text-[#1E293B] mb-1">
            Current Role/Status
          </label>
          <Input
            id="currentRole"
            value={profile.currentRole}
            onChange={(e) => handleChange("currentRole", e.target.value)}
            placeholder="Full-Stack Developer & Creator"
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-[#1E293B] mb-1">
            Work Experience *
          </label>
          <Textarea
            id="experience"
            value={profile.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            placeholder="Describe your work experience, internships, and relevant roles..."
            className="min-h-[120px]"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Include your roles at GeoEvent, Naija Jollof, and any other relevant experience
          </p>
        </div>

        <div>
          <label htmlFor="projects" className="block text-sm font-medium text-[#1E293B] mb-1">
            Projects & Achievements *
          </label>
          <Textarea
            id="projects"
            value={profile.projects}
            onChange={(e) => handleChange("projects", e.target.value)}
            placeholder="Describe your key projects, hackathons, open source contributions..."
            className="min-h-[120px]"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Include ImageMark, GeoEvent, Naija Jollof, and other notable projects
          </p>
        </div>

        <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white py-3" disabled={isLoading}>
          {isLoading ? "Generating Resume..." : "Generate Tailored Resume"}
        </Button>
      </form>
    </div>
  )
}
