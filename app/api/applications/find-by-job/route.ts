import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifySession } from "@/lib/dal"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [API] Finding application by job details...")

    const session = await verifySession()
    if (!session.isAuth || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobTitle, companyName, jobDescription } = await request.json()

    console.log("🔍 [API] Search criteria:", { jobTitle, companyName })

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Search for application by job title and company name
    const { data: applications, error } = await supabase
      .from("job_applications")
      .select("id, job_title, company_name, created_at")
      .eq("user_id", session.user.id)
      .eq("job_title", jobTitle)
      .eq("company_name", companyName)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("❌ [API] Database error:", error)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    if (applications && applications.length > 0) {
      const application = applications[0]
      console.log("✅ [API] Found application:", application.id)
      return NextResponse.json({
        applicationId: application.id,
        jobTitle: application.job_title,
        companyName: application.company_name,
        createdAt: application.created_at,
      })
    } else {
      console.log("⚠️ [API] No matching application found")
      return NextResponse.json({
        applicationId: null,
        message: "No matching application found",
      })
    }
  } catch (error) {
    console.error("❌ [API] Error finding application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
