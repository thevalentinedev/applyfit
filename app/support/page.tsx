"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Book, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Script from "next/script"

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    const turnstileToken = (window as any).turnstile?.getResponse()
    if (!turnstileToken) {
      setError("Please complete the CAPTCHA.")
      setLoading(false)
      return
    }
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, turnstileToken }),
    })
    if (res.ok) {
      setSuccess(true)
      setForm({ name: "", email: "", message: "" })
      ;(window as any).turnstile?.reset()
    } else {
      setError("Failed to send message. Please try again later.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold">Contact Us</h1>
          <p className="text-muted-foreground mt-2">All support, privacy, and legal inquiries must be submitted via this form.</p>
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Contact Form
              </CardTitle>
            </CardHeader>
          <CardContent>
            {success && <Alert className="mb-4">Message sent! We'll get back to you soon.</Alert>}
            {error && <Alert className="mb-4" variant="destructive">{error}</Alert>}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Textarea
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                required
                minLength={10}
              />
              {/* Cloudflare Turnstile Widget */}
              <div className="my-4">
                <div id="turnstile-widget" className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            </CardContent>
          </Card>
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
