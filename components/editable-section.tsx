"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Edit3, Check, X, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { refineResumeSection, refineBulletPoint } from "@/app/actions/refine-section"

interface EditableSectionProps {
  content: string
  onUpdate: (newContent: string) => void
  sectionType: "summary" | "skills" | "experience" | "cover-letter"
  sectionContext?: {
    jobTitle: string
    companyName: string
    jobDescription: string
    userProfile?: any
    useGpt4?: boolean
  }
  multiline?: boolean
  placeholder?: string
  className?: string
  label?: string
  enableBulletRefine?: boolean // New prop for bullet-level refinement
  bulletContext?: {
    roleTitle: string
    company: string
    isExperience: boolean
  }
}

export function EditableSection({
  content,
  onUpdate,
  sectionType,
  sectionContext,
  multiline = false,
  placeholder = "Enter content...",
  className = "",
  label,
  enableBulletRefine,
  bulletContext,
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [isRefining, setIsRefining] = useState(false)
  const [isCustomized, setIsCustomized] = useState(false)
  const [originalContent, setOriginalContent] = useState(content)
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditedContent(content)
    if (!isCustomized) {
      setOriginalContent(content)
    }
  }, [content])

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(editedContent.length, editedContent.length)
      } else if (!multiline && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(editedContent.length, editedContent.length)
      }
    }
  }, [isEditing, multiline, editedContent.length])

  const handleSave = () => {
    onUpdate(editedContent)
    setIsEditing(false)
    if (editedContent !== originalContent) {
      setIsCustomized(true)
      toast({
        title: "Section updated",
        description: "Your changes have been saved.",
        variant: "success",
      })
    }
  }

  const handleCancel = () => {
    setEditedContent(content)
    setIsEditing(false)
  }

  const handleReset = () => {
    setEditedContent(originalContent)
    onUpdate(originalContent)
    setIsCustomized(false)
    setIsEditing(false)
    toast({
      title: "Section reset",
      description: "Content has been restored to the original AI-generated version.",
      variant: "success",
    })
  }

  const handleRefine = async () => {
    if (!sectionContext) {
      toast({
        title: "Cannot refine",
        description: "Missing context for refinement.",
        variant: "destructive",
      })
      return
    }

    setIsRefining(true)
    try {
      const refinedContent = await refineResumeSection(
        sectionType,
        editedContent,
        sectionContext.jobDescription,
        sectionContext.jobTitle,
        sectionContext.companyName,
        sectionContext.useGpt4 || false,
      )

      setEditedContent(refinedContent)
      onUpdate(refinedContent)
      setIsCustomized(true)
      toast({
        title: "Section refined",
        description: "AI has improved the content based on the job requirements.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error refining section:", error)
      toast({
        title: "Refinement failed",
        description: error instanceof Error ? error.message : "Failed to refine section.",
        variant: "destructive",
      })
    } finally {
      setIsRefining(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    } else if (e.key === "Enter" && e.ctrlKey && multiline) {
      e.preventDefault()
      handleSave()
    }
  }

  const handleRefineBullet = async () => {
    if (!sectionContext || !bulletContext) {
      toast({
        title: "Cannot refine",
        description: "Missing context for bullet refinement.",
        variant: "destructive",
      })
      return
    }

    setIsRefining(true)
    try {
      const refinedContent = await refineBulletPoint(
        editedContent,
        sectionContext.jobDescription,
        sectionContext.jobTitle,
        sectionContext.companyName,
        bulletContext,
        sectionContext.useGpt4 || false,
      )

      setEditedContent(refinedContent)
      onUpdate(refinedContent)
      setIsCustomized(true)
      toast({
        title: "Bullet refined",
        description: "AI has improved this bullet point based on the job requirements.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error refining bullet:", error)
      toast({
        title: "Refinement failed",
        description: error instanceof Error ? error.message : "Failed to refine bullet.",
        variant: "destructive",
      })
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div className={`group relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">{label}</label>
          {isCustomized && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              Customized
            </Badge>
          )}
        </div>
      )}

      <div className="relative">
        {isEditing ? (
          <div className="space-y-2">
            {multiline ? (
              <Textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[100px] resize-none"
              />
            ) : (
              <Input
                ref={inputRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
              />
            )}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              {isCustomized && (
                <Button size="sm" variant="ghost" onClick={handleReset} className="text-gray-500">
                  Reset to Original
                </Button>
              )}
              <div className="text-xs text-gray-500">
                {multiline ? "Ctrl+Enter to save, Esc to cancel" : "Enter to save, Esc to cancel"}
              </div>
            </div>
          </div>
        ) : (
          <div className="group/content relative">
            <div
              className={`${multiline ? "whitespace-pre-line" : ""} ${
                content ? "" : "text-gray-400 italic"
              } cursor-text hover:bg-gray-50 rounded p-2 transition-colors`}
              onClick={() => setIsEditing(true)}
            >
              {content || placeholder}
            </div>

            {/* Action buttons - show on hover */}
            <div className="absolute top-1 right-1 opacity-0 group-hover/content:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0 hover:bg-blue-100"
                title="Edit manually"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              {sectionContext && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={enableBulletRefine ? handleRefineBullet : handleRefine}
                  disabled={isRefining}
                  className="h-6 w-6 p-0 hover:bg-purple-100"
                  title={enableBulletRefine ? "Refine this bullet" : "Refine with AI"}
                >
                  {isRefining ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : enableBulletRefine ? (
                    <Sparkles className="h-3 w-3 text-purple-600" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-purple-600" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
