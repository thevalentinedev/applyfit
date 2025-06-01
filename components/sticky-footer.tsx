"use client"

import Link from "next/link"
import { Github, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StickyFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          {/* Left */}
          <div className="flex items-center gap-3">
            <span className="font-medium">Applyfit © {currentYear}</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                <Link
                  href="https://github.com/thevalentinedev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Github className="h-3 w-3" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                <Link
                  href="https://www.linkedin.com/in/valentine-ohalebo-51bb37221/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="h-3 w-3" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
