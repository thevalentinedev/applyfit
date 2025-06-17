import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifySession } from "@/lib/dal"

export async function DELETE(request: NextRequest) {
  try {
    const { applicationId } = await request.json()

    // Verify user session
    const session = await verifySession()
    if (!session.isAuth || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", applicationId)
      .eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting application:", error)
      return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
