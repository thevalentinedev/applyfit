"use server"

import { updateUserProfile as updateProfileInDb } from "@/lib/dal"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: FormData) {
  try {
    const profileData = {
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      location: formData.get("location") as string,
      website: formData.get("website") as string,
      linkedin_url: formData.get("linkedin_url") as string,
      github_url: formData.get("github_url") as string,
      education: JSON.parse((formData.get("education") as string) || "[]"),
      professional_experience: JSON.parse((formData.get("professional_experience") as string) || "[]"),
      projects_achievements: JSON.parse((formData.get("projects_achievements") as string) || "[]"),
    }

    // Remove empty strings and null values
    const cleanedData = Object.fromEntries(
      Object.entries(profileData).filter(([_, value]) => {
        if (typeof value === "string") {
          return value !== "" && value !== null
        }
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== null
      }),
    )

    const result = await updateProfileInDb(cleanedData)

    if (!result) {
      return { success: false, error: "Failed to update profile" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")

    return { success: true, data: result }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
