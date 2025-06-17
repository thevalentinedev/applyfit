// Import the enhanced functions
import {
  regenerateResumeSection as enhancedRegenerate,
  type BulletGenerationContext,
} from "@/lib/enhanced-bullet-generator"

// Update the main function to use enhanced generation
export async function regenerateResumeSection(
  sectionType: "summary" | "skills" | "experience" | "projects",
  context: BulletGenerationContext,
  sectionIndex?: number,
) {
  return enhancedRegenerate(sectionType, context, sectionIndex)
}
