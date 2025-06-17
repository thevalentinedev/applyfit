import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")
  const error_code = searchParams.get("error_code")
  const next = searchParams.get("next") ?? "/dashboard"

  // Handle authentication errors from Supabase
  if (error) {
    let errorMessage = error_description || error

    // Provide user-friendly error messages
    if (error_code === "otp_expired" || error === "otp_expired") {
      errorMessage = "Your verification link has expired. Please request a new one."
    } else if (error === "access_denied") {
      errorMessage = "Access denied. Please try signing in again."
    }

    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(errorMessage)}`)
  }

  if (code) {
    const supabase = await createClient()

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!exchangeError) {
        // Successful authentication - redirect to intended destination
        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }

      // Handle exchange error
      let errorMessage = exchangeError.message
      if (exchangeError.message.includes("expired")) {
        errorMessage = "Your verification link has expired. Please request a new one."
      }

      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(errorMessage)}`)
    } catch (error) {
      return NextResponse.redirect(
        `${origin}/auth/error?message=${encodeURIComponent("An unexpected error occurred during authentication")}`,
      )
    }
  }

  // No code provided - redirect to error
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent("No authentication code provided")}`)
}
