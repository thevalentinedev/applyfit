"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { KeyRound, Loader2, ArrowLeft, RefreshCw } from "lucide-react"

interface OtpVerificationProps {
  email: string
  onBack: () => void
  onSuccess: () => void
}

export function OtpVerification({ email, onBack, onSuccess }: OtpVerificationProps) {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { toast } = useToast()
  const supabase = createClient()

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      })

      if (error) {
        toast({
          title: "Invalid code",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: "You have been signed in successfully.",
        })
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Code resent",
          description: "Check your email for the new verification code.",
        })
        setCountdown(60) // 60 second cooldown
        setOtp("") // Clear current OTP
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const formatOtp = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digits = value.replace(/\D/g, "").slice(0, 6)
    return digits
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-heading">Enter verification code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <br />
          <strong className="text-foreground">{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="sr-only">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(formatOtp(e.target.value))}
              maxLength={6}
              required
              disabled={isLoading}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoComplete="one-time-code"
            />
            <p className="text-xs text-muted-foreground text-center">Enter the 6-digit code from your email</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Sign In"
            )}
          </Button>

          <div className="space-y-3">
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isResending || countdown > 0}
                className="text-sm"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend code
                  </>
                )}
              </Button>
            </div>

            <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Didn't receive the code? Check your spam folder or try resending.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
