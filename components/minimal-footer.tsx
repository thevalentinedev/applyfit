"use client"

import Link from "next/link"

export function MinimalFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-xs text-muted-foreground">
          <span className="font-medium">Applyfit © {currentYear}</span>
          <span className="hidden sm:inline">•</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
