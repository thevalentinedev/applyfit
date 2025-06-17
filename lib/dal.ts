import { cache } from "react"
import { createClient } from "./supabase/server"

export const verifySession = cache(async () => {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return { isAuth: false, user: null }
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { isAuth: false, user: null }
    }

    if (!user) {
      return { isAuth: false, user: null }
    }

    return { isAuth: true, user }
  } catch (error) {
    return { isAuth: false, user: null }
  }
})

export const getUserProfile = cache(async () => {
  try {
    const session = await verifySession()

    if (!session.isAuth || !session.user) {
      return null
    }

    const supabase = await createClient()

    if (!supabase) {
      return null
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      return null
    }

    return profile
  } catch (error) {
    return null
  }
})

export const getJobApplications = cache(async () => {
  try {
    const session = await verifySession()

    if (!session.isAuth || !session.user) {
      return []
    }

    const supabase = await createClient()

    if (!supabase) {
      return []
    }

    const { data: applications, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return []
    }

    return applications || []
  } catch (error) {
    return []
  }
})

export const getJobApplicationStats = cache(async () => {
  try {
    const applications = await getJobApplications()

    const stats = applications.reduce(
      (acc, app) => {
        const status = app.status || "applied"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const result = {
      total: applications.length,
      applied: stats.applied || 0,
      interviewed: stats.interviewed || 0,
      rejected: stats.rejected || 0,
      ghosted: stats.ghosted || 0,
      offer: stats.offer || 0,
    }

    return result
  } catch (error) {
    return {
      total: 0,
      applied: 0,
      interviewed: 0,
      rejected: 0,
      ghosted: 0,
      offer: 0,
    }
  }
})

export const createJobApplication = async (applicationData: {
  company_name: string
  job_title: string
  job_link?: string | null
  resume_url?: string | null
  cover_letter?: string | null
  status?: string
  job_description?: string
  resume_generated_at?: string
  resume_content?: any
  application_notes?: string
}) => {
  try {
    const session = await verifySession()

    if (!session.isAuth || !session.user) {
      throw new Error("User not authenticated")
    }

    const supabase = await createClient()

    if (!supabase) {
      throw new Error("Supabase client not created")
    }

    const { data: newApplication, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: session.user.id,
        company_name: applicationData.company_name,
        job_title: applicationData.job_title,
        job_link: applicationData.job_link,
        resume_url: applicationData.resume_url,
        cover_letter: applicationData.cover_letter,
        status: applicationData.status || "applied",
        job_description: applicationData.job_description,
        resume_generated_at: applicationData.resume_generated_at,
        resume_content: applicationData.resume_content,
        application_notes: applicationData.application_notes,
        date_applied: new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return newApplication
  } catch (error) {
    throw error
  }
}

export const findOrCreateJobApplication = async (applicationData: {
  company_name: string
  job_title: string
  job_link?: string | null
  job_description?: string
  resume_generated_at?: string
}) => {
  try {
    const session = await verifySession()

    if (!session.isAuth || !session.user) {
      throw new Error("User not authenticated")
    }

    const supabase = await createClient()

    if (!supabase) {
      throw new Error("Supabase client not created")
    }

    // First, try to find existing application
    const { data: existingApplication, error: findError } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("company_name", applicationData.company_name)
      .eq("job_title", applicationData.job_title)
      .single()

    if (existingApplication && !findError) {
      console.log("📋 Found existing application, updating resume data...")

      // Update existing application with resume data
      const { data: updatedApplication, error: updateError } = await supabase
        .from("job_applications")
        .update({
          resume_generated_at: applicationData.resume_generated_at,
          job_description: applicationData.job_description || existingApplication.job_description,
          job_link: applicationData.job_link || existingApplication.job_link,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingApplication.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return updatedApplication
    }

    // If no existing application found, create new one
    console.log("📝 No existing application found, creating new one...")
    return await createJobApplication(applicationData)
  } catch (error) {
    throw error
  }
}

export const updateUserProfile = async (profileData: any) => {
  try {
    const session = await verifySession()

    if (!session.isAuth || !session.user) {
      throw new Error("User not authenticated")
    }

    const supabase = await createClient()

    if (!supabase) {
      throw new Error("Supabase client not created")
    }

    const { data: updatedProfile, error } = await supabase
      .from("user_profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return updatedProfile
  } catch (error) {
    throw error
  }
}

export const getJobApplicationsWithResumes = cache(async () => {
  return await getJobApplications()
})

export const getApplicationById = cache(async (applicationId: string) => {
  try {
    const session = await verifySession()

    if (!session.isAuth || !session.user) {
      return null
    }

    const supabase = await createClient()

    if (!supabase) {
      return null
    }

    const { data: application, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      return null
    }

    return application
  } catch (error) {
    return null
  }
})

export const updateJobApplicationWithResume = async (
  applicationId: string,
  resumeData: {
    resume_url?: string
    resume_content?: any
    resume_generated_at?: string
  },
) => {
  try {
    const session = await verifySession()

    if (!session.isAuth || !session.user) {
      throw new Error("User not authenticated")
    }

    const supabase = await createClient()

    if (!supabase) {
      throw new Error("Supabase client not created")
    }

    const { data: updatedApplication, error } = await supabase
      .from("job_applications")
      .update({
        ...resumeData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return updatedApplication
  } catch (error) {
    throw error
  }
}
