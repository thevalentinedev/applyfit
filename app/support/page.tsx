import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, MessageCircle, Book, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold">Support Center</h1>
          <p className="text-muted-foreground mt-2">Get help with authentication and account issues</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Common Issues
              </CardTitle>
              <CardDescription>Solutions to frequently encountered problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Not receiving emails?</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Check spam/junk folder</li>
                  <li>• Wait up to 5 minutes</li>
                  <li>• Verify email address spelling</li>
                  <li>• Try resending</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">OTP code not working?</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Codes expire after 10 minutes</li>
                  <li>• Use the most recent code</li>
                  <li>• Request a new code if expired</li>
                  <li>• Try magic link instead</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Magic link expired?</h4>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Links expire after 1 hour</li>
                  <li>• Request a new magic link</li>
                  <li>• Use OTP code as alternative</li>
                  <li>• Check for multiple emails</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>Get personalized help from our team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Email Support:</strong>
                  <br />
                  Send us a detailed message about your issue and we'll get back to you within 24 hours.
                </AlertDescription>
              </Alert>

              <Button className="w-full" asChild>
                <a href="mailto:support@applyfit.com?subject=Authentication%20Issue">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </a>
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Include in your message:</strong>
                </p>
                <ul className="mt-1 space-y-1">
                  <li>• Your email address</li>
                  <li>• Authentication method used</li>
                  <li>• Error message received</li>
                  <li>• Steps you've already tried</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
