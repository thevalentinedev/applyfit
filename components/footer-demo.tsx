"use client"

import { useState } from "react"
import { Footer } from "@/components/footer"
import { EnhancedFooter } from "@/components/enhanced-footer"
import { MinimalFooter } from "@/components/minimal-footer"
import { StickyFooter } from "@/components/sticky-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type FooterVariant = "minimal" | "standard" | "enhanced" | "sticky"

export function FooterDemo() {
  const [footerVariant, setFooterVariant] = useState<FooterVariant>("standard")

  const renderFooter = () => {
    switch (footerVariant) {
      case "minimal":
        return <MinimalFooter />
      case "standard":
        return <Footer />
      case "enhanced":
        return <EnhancedFooter />
      case "sticky":
        return <StickyFooter />
      default:
        return <Footer />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Footer Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={footerVariant === "minimal" ? "default" : "outline"}
              onClick={() => setFooterVariant("minimal")}
              size="sm"
            >
              Minimal
            </Button>
            <Button
              variant={footerVariant === "standard" ? "default" : "outline"}
              onClick={() => setFooterVariant("standard")}
              size="sm"
            >
              Standard
            </Button>
            <Button
              variant={footerVariant === "enhanced" ? "default" : "outline"}
              onClick={() => setFooterVariant("enhanced")}
              size="sm"
            >
              Enhanced
            </Button>
            <Button
              variant={footerVariant === "sticky" ? "default" : "outline"}
              onClick={() => setFooterVariant("sticky")}
              size="sm"
            >
              Sticky
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-background">
            {/* Mock content to show footer positioning */}
            <div className="p-8 min-h-[200px] bg-muted/20">
              <h3 className="font-heading font-semibold mb-2">Page Content</h3>
              <p className="text-muted-foreground">
                This represents the main content of your page. The footer will appear below this content.
              </p>
            </div>
            {renderFooter()}
          </div>

          <div className="mt-4 text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Minimal:</strong> Ultra-clean, single line with essential info only
            </p>
            <p>
              <strong>Standard:</strong> Clean layout with brand and essential links (Recommended)
            </p>
            <p>
              <strong>Enhanced:</strong> Full-featured with social links and detailed sections
            </p>
            <p>
              <strong>Sticky:</strong> Compact footer that sticks to bottom of viewport
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
