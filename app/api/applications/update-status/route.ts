import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifySession } from "@/lib/dal"

export async function POST(request: NextRequest) {
  try {
    const { applicationId, status } = await request.json()

    // Verify user session
    const session = await verifySession()
    if (!session.isAuth || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate status
    const validStatuses = ["applied", "interviewed", "offer", "ghosted"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("job_applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating application status:", error)
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in update-status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
