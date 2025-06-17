"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile } from "@/app/actions/update-profile"
import { Loader2, Save, Plus, User, MapPin, Globe, Phone, Briefcase, GraduationCap, Award, Trash2 } from "lucide-react"

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

interface UserProfileFormProps {
  profile: UserProfile
  onSuccess?: () => void
}

export function UserProfileForm({ profile, onSuccess }: UserProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [education, setEducation] = useState<Education[]>(profile.education || [])
  const [experience, setExperience] = useState<Experience[]>(profile.professional_experience || [])
  const [projects, setProjects] = useState<Project[]>(profile.projects_achievements || [])
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      // Add complex data to form data
      formData.append("education", JSON.stringify(education))
      formData.append("professional_experience", JSON.stringify(experience))
      formData.append("projects_achievements", JSON.stringify(projects))

      const result = await updateUserProfile(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
    }
    setEducation([...education, newEducation])
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const addExperience = () => {
    const newExperience: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      current: false,
      description: "",
    }
    setExperience([...experience, newExperience])
  }

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperience(experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const removeExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id))
  }

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      technologies: [],
      start_date: "",
    }
    setProjects([...projects, newProject])
  }

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setProjects(projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)))
  }

  const removeProject = (id: string) => {
    setProjects(projects.filter((proj) => proj.id !== id))
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your personal contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile.full_name || ""}
                  placeholder="Your full name"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled className="bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone || ""}
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={profile.location || ""}
                  placeholder="City, State/Country"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={profile.website || ""}
                  placeholder="https://yourwebsite.com"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  type="url"
                  defaultValue={profile.linkedin_url || ""}
                  placeholder="https://linkedin.com/in/username"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub</Label>
                <Input
                  id="github_url"
                  name="github_url"
                  type="url"
                  defaultValue={profile.github_url || ""}
                  placeholder="https://github.com/username"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
            <CardDescription>Your educational background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Education #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution *</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                      placeholder="University/School name"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree *</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      placeholder="Bachelor's, Master's, etc."
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field_of_study}
                      onChange={(e) => updateEducation(edu.id, "field_of_study", e.target.value)}
                      placeholder="Computer Science, etc."
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={edu.start_date}
                      onChange={(e) => updateEducation(edu.id, "start_date", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={edu.end_date}
                      onChange={(e) => updateEducation(edu.id, "end_date", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>GPA (Optional)</Label>
                    <Input
                      value={edu.gpa || ""}
                      onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                      placeholder="3.8/4.0"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={edu.description || ""}
                    onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                    placeholder="Relevant coursework, achievements, etc."
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}

            <Button type="button" onClick={addEducation} variant="outline" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </CardContent>
        </Card>

        {/* Professional Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Experience
            </CardTitle>
            <CardDescription>Your work history and experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {experience.map((exp, index) => (
              <div key={exp.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Experience #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company *</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      placeholder="Company name"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position *</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                      placeholder="Job title"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={exp.location || ""}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      placeholder="City, State"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.start_date}
                      onChange={(e) => updateExperience(exp.id, "start_date", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={exp.end_date}
                      onChange={(e) => updateExperience(exp.id, "end_date", e.target.value)}
                      disabled={exp.current || isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => {
                      updateExperience(exp.id, "current", e.target.checked)
                      if (e.target.checked) {
                        updateExperience(exp.id, "end_date", "")
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`current-${exp.id}`}>I currently work here</Label>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            ))}

            <Button type="button" onClick={addExperience} variant="outline" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </CardContent>
        </Card>

        {/* Projects and Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Projects & Achievements
            </CardTitle>
            <CardDescription>Your notable projects and accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project, index) => (
              <div key={project.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Project #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Project Title *</Label>
                  <Input
                    value={project.title}
                    onChange={(e) => updateProject(project.id, "title", e.target.value)}
                    placeholder="Project name"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, "description", e.target.value)}
                    placeholder="Describe the project and your role..."
                    rows={3}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={project.start_date}
                      onChange={(e) => updateProject(project.id, "start_date", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="month"
                      value={project.end_date || ""}
                      onChange={(e) => updateProject(project.id, "end_date", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project URL (Optional)</Label>
                    <Input
                      type="url"
                      value={project.url || ""}
                      onChange={(e) => updateProject(project.id, "url", e.target.value)}
                      placeholder="https://project-demo.com"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL (Optional)</Label>
                    <Input
                      type="url"
                      value={project.github_url || ""}
                      onChange={(e) => updateProject(project.id, "github_url", e.target.value)}
                      placeholder="https://github.com/user/project"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <Input
                    value={project.technologies.join(", ")}
                    onChange={(e) =>
                      updateProject(project.id, "technologies", e.target.value.split(", ").filter(Boolean))
                    }
                    placeholder="React, Node.js, PostgreSQL, etc."
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">Separate technologies with commas</p>
                </div>
              </div>
            ))}

            <Button type="button" onClick={addProject} variant="outline" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
