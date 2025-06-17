"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  MapPin,
  Globe,
  Phone,
  Mail,
  Linkedin,
  Github,
  GraduationCap,
  Briefcase,
  Award,
  ExternalLink,
  Calendar,
  X,
} from "lucide-react"

interface Education {
  id: string
  institution: string
  degree: string
  field_of_study: string
  start_date: string
  end_date: string
  gpa?: string
  description?: string
}

interface Experience {
  id: string
  company: string
  position: string
  start_date: string
  end_date: string
  current: boolean
  description: string
  location?: string
}

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  start_date: string
  end_date?: string
  url?: string
  github_url?: string
}

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  phone: string | null
  location: string | null
  website: string | null
  linkedin_url: string | null
  github_url: string | null
  education: Education[] | null
  professional_experience: Experience[] | null
  projects_achievements: Project[] | null
}

interface UserProfilePreviewProps {
  profile: UserProfile
}

// Helper function to format phone number
const formatPhoneNumber = (phone: string) => {
  if (!phone) return ""
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  // Format as XXX XXX XXXX
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone // Return original if not 10 digits
}

function formatDate(dateString: string): string {
  if (!dateString) return ""
  try {
    const date = new Date(dateString + "-01") // Add day for month input
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  } catch {
    return dateString
  }
}

export function UserProfilePreview({ profile }: UserProfilePreviewProps) {
  const education = profile.education || []
  const experience = profile.professional_experience || []
  const projects = profile.projects_achievements || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
            <Button variant="ghost" size="sm" onClick={() => window.close()} className="hover:bg-white/50">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {profile.full_name || "User Profile"}
                </CardTitle>
                <CardDescription>Professional Profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>

                    {profile.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{formatPhoneNumber(profile.phone)}</span>
                      </div>
                    )}

                    {profile.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {profile.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          makeitnow <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {profile.linkedin_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          LinkedIn <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {profile.github_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Github className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          GitHub <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            {education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-blue-200 pl-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-muted-foreground">{edu.institution}</p>
                          {edu.field_of_study && <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                          </div>
                          {edu.gpa && <div className="mt-1">GPA: {edu.gpa}</div>}
                        </div>
                      </div>
                      {edu.description && <p className="text-sm text-muted-foreground">{edu.description}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Professional Experience */}
            {experience.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-green-200 pl-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{exp.position}</h4>
                          <p className="text-muted-foreground">{exp.company}</p>
                          {exp.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {exp.location}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(exp.start_date)} - {exp.current ? "Present" : formatDate(exp.end_date)}
                          </div>
                          {exp.current && (
                            <Badge variant="secondary" className="mt-1">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Projects and Achievements */}
            {projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Projects & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border-l-2 border-purple-200 pl-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{project.title}</h4>
                          <div className="flex gap-2 mt-1">
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <Globe className="h-3 w-3" />
                                Demo <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <Github className="h-3 w-3" />
                                Code <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(project.start_date)} -{" "}
                            {project.end_date ? formatDate(project.end_date) : "Ongoing"}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{project.description}</p>
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <Button onClick={() => window.close()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
