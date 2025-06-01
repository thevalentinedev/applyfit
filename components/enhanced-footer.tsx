"use client"

import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/thevalentinedev",
      icon: Github,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/valentine-ohalebo-51bb37221/",
      icon: Linkedin,
    },
    {
      name: "Email",
      href: "mailto:hello@valentine.dev",
      icon: Mail,
    },
  ]

  const footerLinks = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
  ]

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand section */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-lg">Applyfit</h3>
            <p className="text-sm text-muted-foreground">
              Smart, AI-powered resume and cover letter generator that helps you land your dream job.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social links */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Connect</h4>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <span>© {currentYear} Applyfit. All rights reserved.</span>
            <span>Made by Valentine Ohalebo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
