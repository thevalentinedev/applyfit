import Link from "next/link"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">Check Your Email</CardTitle>
          <CardDescription>We've sent you a magic link to sign in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click the link in your email to complete the sign-in process. The link will expire in 1 hour.
            </p>
          </div>

          <div className="space-y-2">
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Didn't receive the email? Check your spam folder or try again.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
