"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Mail, Phone, MapPin, Globe, Linkedin, Github, GraduationCap, Briefcase } from "lucide-react"
import type { UserProfile } from "@/app/actions/generate-resume"

interface UserProfilePreviewProps {
  userProfile: UserProfile
  onClose: () => void
}

export function UserProfilePreview({ userProfile, onClose }: UserProfilePreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/50">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Header Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {userProfile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{userProfile.name}</div>
                        <div className="text-sm text-gray-500">{userProfile.currentRole}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${userProfile.email}`} className="text-blue-600 hover:underline">
                          {userProfile.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{userProfile.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{userProfile.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {userProfile.portfolio && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a
                          href={userProfile.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {userProfile.portfolio.replace("https://", "")}
                        </a>
                      </div>
                    )}
                    {userProfile.linkedin && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-4 w-4 text-gray-400" />
                        <a
                          href={userProfile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {userProfile.github && (
                      <div className="flex items-center gap-2 text-sm">
                        <Github className="h-4 w-4 text-gray-400" />
                        <a
                          href={userProfile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          GitHub Profile
                        </a>
                      </div>
                    )}
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
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900">{userProfile.education}</div>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{userProfile.experience}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Projects & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{userProfile.projects}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
