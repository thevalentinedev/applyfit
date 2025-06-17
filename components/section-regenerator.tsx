"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { regenerateResumeSection, type BulletGenerationContext, type SectionType } from "@/lib/resume-bullet-generator"

interface SectionRegeneratorProps {
  sectionType: SectionType
  sectionIndex?: number
  context: BulletGenerationContext
  onRegenerated: (newContent: any) => void
  className?: string
}

export function SectionRegenerator({
  sectionType,
  sectionIndex,
  context,
  onRegenerated,
  className = "",
}: SectionRegeneratorProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const { toast } = useToast()

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const newContent = await regenerateResumeSection(sectionType, context, sectionIndex)
      onRegenerated(newContent)

      toast({
        title: "Section regenerated",
        description: `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} has been updated with fresh content.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error regenerating section:", error)
      toast({
        title: "Regeneration failed",
        description: "Failed to regenerate section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRegenerate}
      disabled={isRegenerating}
      className={`text-gray-500 hover:text-gray-700 ${className}`}
      title={`Regenerate ${sectionType}`}
    >
      {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
    </Button>
  )
}
