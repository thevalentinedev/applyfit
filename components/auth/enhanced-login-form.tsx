"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  KeyRound,
  Mail,
  Loader2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Lock,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PasswordLoginForm } from "./password-login-form"

type AuthMethod = "otp" | "magic-link" | "password"
type AuthStep = "method-selection" | "email-input" | "otp-verification" | "magic-link-sent" | "password-login"
type AuthStatus = "idle" | "sending" | "sent" | "verifying" | "success" | "error"

interface AuthState {
  method: AuthMethod
  step: AuthStep
  status: AuthStatus
  email: string
  otp: string
  error: string | null
  resendCount: number
  resendCooldown: number
  lastSentAt: Date | null
}

export function EnhancedLoginForm() {
  const [state, setState] = useState<AuthState>({
    method: "otp", // OTP is primary
    step: "method-selection",
    status: "idle",
    email: "",
    otp: "",
    error: null,
    resendCount: 0,
    resendCooldown: 0,
    lastSentAt: null,
  })

  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (state.resendCooldown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, resendCooldown: prev.resendCooldown - 1 }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.resendCooldown])

  const updateState = (updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const resetState = () => {
    setState({
      method: "otp",
      step: "method-selection",
      status: "idle",
      email: "",
      otp: "",
      error: null,
      resendCount: 0,
      resendCooldown: 0,
      lastSentAt: null,
    })
  }

  const handleMethodSelection = (method: AuthMethod) => {
    updateState({
      method,
      step: method === "password" ? "password-login" : "email-input",
      error: null,
    })
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.email.trim()) return

    updateState({ status: "sending", error: null })

    try {
      if (state.method === "otp") {
        const { error } = await supabase.auth.signInWithOtp({
          email: state.email,
          options: {
            shouldCreateUser: true,
          },
        })

        if (error) {
          updateState({
            status: "error",
            error: `Failed to send OTP: ${error.message}`,
          })
          toast({
            title: "OTP Send Failed",
            description: error.message,
            variant: "destructive",
          })
        } else {
          updateState({
            status: "sent",
            step: "otp-verification",
            lastSentAt: new Date(),
            resendCooldown: 60, // 60 second cooldown
          })
          toast({
            title: "OTP Sent Successfully",
            description: `Check your email at ${state.email} for the 6-digit code.`,
          })
        }
      } else {
        // Magic link
        const { error } = await supabase.auth.signInWithOtp({
          email: state.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          updateState({
            status: "error",
            error: `Failed to send magic link: ${error.message}`,
          })
          toast({
            title: "Magic Link Send Failed",
            description: error.message,
            variant: "destructive",
          })
        } else {
          updateState({
            status: "sent",
            step: "magic-link-sent",
            lastSentAt: new Date(),
            resendCooldown: 30, // 30 second cooldown for magic links
          })
          toast({
            title: "Magic Link Sent",
            description: `Check your email at ${state.email} and click the link to sign in.`,
          })
        }
      }
    } catch (error) {
      updateState({
        status: "error",
        error: "An unexpected error occurred. Please try again.",
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.otp.length !== 6) return

    updateState({ status: "verifying", error: null })

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: state.email,
        token: state.otp,
        type: "email",
      })

      if (error) {
        let errorMessage = error.message

        // Provide specific error messages
        if (error.message.includes("expired")) {
          errorMessage = "Your OTP has expired. Please request a new one."
        } else if (error.message.includes("invalid")) {
          errorMessage = "Invalid OTP code. Please check and try again."
        }

        updateState({
          status: "error",
          error: errorMessage,
        })
        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        updateState({ status: "success" })
        toast({
          title: "Success!",
          description: "You have been signed in successfully.",
        })
        // Redirect will happen automatically
        window.location.href = "/dashboard"
      }
    } catch (error) {
      updateState({
        status: "error",
        error: "Verification failed. Please try again.",
      })
      toast({
        title: "Error",
        description: "Verification failed",
        variant: "destructive",
      })
    }
  }

  const handleResend = async () => {
    if (state.resendCooldown > 0) return

    updateState({
      status: "sending",
      error: null,
      resendCount: state.resendCount + 1,
    })

    try {
      if (state.method === "otp") {
        const { error } = await supabase.auth.signInWithOtp({
          email: state.email,
          options: {
            shouldCreateUser: true,
          },
        })

        if (error) {
          updateState({
            status: "error",
            error: `Failed to resend OTP: ${error.message}`,
          })
        } else {
          updateState({
            status: "sent",
            lastSentAt: new Date(),
            resendCooldown: Math.min(60 + state.resendCount * 30, 300), // Increasing cooldown, max 5 minutes
            otp: "", // Clear previous OTP
          })
          toast({
            title: "OTP Resent",
            description: "A new 6-digit code has been sent to your email.",
          })
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: state.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          updateState({
            status: "error",
            error: `Failed to resend magic link: ${error.message}`,
          })
        } else {
          updateState({
            status: "sent",
            lastSentAt: new Date(),
            resendCooldown: Math.min(30 + state.resendCount * 15, 120), // Increasing cooldown, max 2 minutes
          })
          toast({
            title: "Magic Link Resent",
            description: "A new magic link has been sent to your email.",
          })
        }
      }
    } catch (error) {
      updateState({
        status: "error",
        error: "Failed to resend. Please try again.",
      })
    }
  }

  const formatOtp = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 6)
  }

  const getTimeSinceLastSent = () => {
    if (!state.lastSentAt) return ""
    const minutes = Math.floor((Date.now() - state.lastSentAt.getTime()) / 60000)
    if (minutes < 1) return "just now"
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  }

  // Method Selection Step
  if (state.step === "method-selection") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Sign In</CardTitle>
          <CardDescription>Choose your preferred authentication method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={() => handleMethodSelection("otp")}
              className="w-full h-auto p-4 flex flex-col items-center space-y-2"
              variant="outline"
            >
              <div className="flex items-center space-x-2">
                <KeyRound className="h-5 w-5" />
                <span className="font-medium">OTP Code</span>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Recommended</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Get a 6-digit code sent to your email</p>
            </Button>

            <Button
              onClick={() => handleMethodSelection("magic-link")}
              className="w-full h-auto p-4 flex flex-col items-center space-y-2"
              variant="outline"
            >
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Magic Link</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Click a link in your email to sign in instantly
              </p>
            </Button>

            <Button
              onClick={() => handleMethodSelection("password")}
              className="w-full h-auto p-4 flex flex-col items-center space-y-2"
              variant="outline"
            >
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Password</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Demo</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Sign in with email and password</p>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Both methods are secure and will create an account if you're new
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Email Input Step
  if (state.step === "email-input") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {state.method === "otp" ? (
              <KeyRound className="h-6 w-6 text-primary" />
            ) : (
              <Mail className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-heading">
            {state.method === "otp" ? "Get OTP Code" : "Get Magic Link"}
          </CardTitle>
          <CardDescription>
            {state.method === "otp"
              ? "We'll send a 6-digit code to your email"
              : "We'll send a secure link to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={state.email}
                onChange={(e) => updateState({ email: e.target.value })}
                required
                disabled={state.status === "sending"}
                autoComplete="email"
              />
            </div>

            <Button type="submit" className="w-full" disabled={state.status === "sending" || !state.email.trim()}>
              {state.status === "sending" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {state.method === "otp" ? "Sending OTP..." : "Sending Magic Link..."}
                </>
              ) : (
                <>
                  {state.method === "otp" ? <KeyRound className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                  {state.method === "otp" ? "Send OTP Code" : "Send Magic Link"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => updateState({ step: "method-selection", error: null })}
              className="w-full"
              disabled={state.status === "sending"}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to method selection
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // OTP Verification Step
  if (state.step === "otp-verification") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-heading">Enter OTP Code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <br />
            <strong className="text-foreground">{state.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOtpVerification} className="space-y-6">
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp" className="sr-only">
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={state.otp}
                onChange={(e) => updateState({ otp: formatOtp(e.target.value) })}
                maxLength={6}
                required
                disabled={state.status === "verifying"}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoComplete="one-time-code"
              />
              <p className="text-xs text-muted-foreground text-center">Enter the 6-digit code from your email</p>
            </div>

            <Button type="submit" className="w-full" disabled={state.status === "verifying" || state.otp.length !== 6}>
              {state.status === "verifying" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </Button>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Code sent {getTimeSinceLastSent()}</span>
                {state.resendCount > 0 && (
                  <span className="text-muted-foreground">Attempt {state.resendCount + 1}</span>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={state.status === "sending" || state.resendCooldown > 0}
                className="w-full"
              >
                {state.status === "sending" ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending...
                  </>
                ) : state.resendCooldown > 0 ? (
                  <>
                    <Clock className="mr-2 h-3 w-3" />
                    Resend in {state.resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend OTP Code
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => updateState({ step: "email-input", otp: "", error: null })}
                className="w-full"
                disabled={state.status === "verifying"}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Email Address
              </Button>
            </div>

            {/* Troubleshooting Section */}
            <Collapsible open={showTroubleshooting} onOpenChange={setShowTroubleshooting}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full text-sm">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Not receiving the code?
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Troubleshooting steps:</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Check your spam/junk folder</li>
                      <li>Wait a few minutes for delivery</li>
                      <li>Ensure {state.email} is correct</li>
                      <li>Try resending the code</li>
                      <li>Switch to Magic Link if issues persist</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => handleMethodSelection("magic-link")} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Switch to Magic Link
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Magic Link Sent Step
  if (state.step === "magic-link-sent") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-heading">Check Your Email</CardTitle>
          <CardDescription>
            We sent a magic link to <br />
            <strong className="text-foreground">{state.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Next steps:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Open your email inbox</li>
                <li>Look for an email from our service</li>
                <li>Click the "Sign In" link in the email</li>
                <li>You'll be automatically signed in</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Link sent {getTimeSinceLastSent()}</span>
              {state.resendCount > 0 && <span className="text-muted-foreground">Attempt {state.resendCount + 1}</span>}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={state.status === "sending" || state.resendCooldown > 0}
              className="w-full"
            >
              {state.status === "sending" ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Resending...
                </>
              ) : state.resendCooldown > 0 ? (
                <>
                  <Clock className="mr-2 h-3 w-3" />
                  Resend in {state.resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Resend Magic Link
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => updateState({ step: "email-input", error: null })}
              className="w-full"
              disabled={state.status === "sending"}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Email Address
            </Button>
          </div>

          {/* Troubleshooting Section */}
          <Collapsible open={showTroubleshooting} onOpenChange={setShowTroubleshooting}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full text-sm">
                <HelpCircle className="mr-2 h-4 w-4" />
                Not receiving the magic link?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Troubleshooting steps:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Check your spam/junk folder</li>
                    <li>Wait up to 5 minutes for delivery</li>
                    <li>Ensure {state.email} is correct</li>
                    <li>Try resending the magic link</li>
                    <li>Switch to OTP Code if issues persist</li>
                    <li>Links expire after 1 hour</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={() => handleMethodSelection("otp")} className="w-full">
                <KeyRound className="mr-2 h-4 w-4" />
                Switch to OTP Code
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <div className="text-center">
            <Button variant="ghost" onClick={resetState} className="text-sm">
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.step === "password-login") {
    return <PasswordLoginForm onBack={() => updateState({ step: "method-selection", error: null })} />
  }

  return null
}
