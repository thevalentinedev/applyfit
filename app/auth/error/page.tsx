"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, RefreshCw, Mail, KeyRound } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("message") || "An authentication error occurred"

  const getErrorDetails = (errorMessage: string) => {
    if (errorMessage.includes("expired")) {
      return {
        title: "Link Expired",
        description: "Your authentication link has expired. Links are valid for 1 hour.",
        suggestions: [
          "Request a new magic link or OTP code",
          "Check if you have multiple emails and use the latest one",
          "Clear your browser cache and try again",
        ],
      }
    }

    if (errorMessage.includes("invalid") || errorMessage.includes("otp")) {
      return {
        title: "Invalid Code",
        description: "The verification code you entered is incorrect or has expired.",
        suggestions: [
          "Double-check the 6-digit code in your email",
          "Request a new OTP code if the current one expired",
          "Try switching to magic link authentication",
        ],
      }
    }

    if (errorMessage.includes("access_denied")) {
      return {
        title: "Access Denied",
        description: "Authentication was cancelled or denied.",
        suggestions: [
          "Try signing in again",
          "Check if you clicked the correct link",
          "Contact support if the issue persists",
        ],
      }
    }

    return {
      title: "Authentication Error",
      description: "Something went wrong during the authentication process.",
      suggestions: ["Try signing in again", "Check your internet connection", "Try a different authentication method"],
    }
  }

  const errorDetails = getErrorDetails(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-heading text-red-600">{errorDetails.title}</CardTitle>
          <CardDescription>{errorDetails.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What you can do:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login?method=otp">
                  <KeyRound className="mr-2 h-3 w-3" />
                  Use OTP
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login?method=magic-link">
                  <Mail className="mr-2 h-3 w-3" />
                  Use Magic Link
                </Link>
              </Button>
            </div>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Still having trouble?{" "}
              <Link href="/support" className="underline hover:no-underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
