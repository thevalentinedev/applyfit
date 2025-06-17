"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { EnhancedHeader } from "@/components/enhanced-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HeaderDemo() {
  const [headerVariant, setHeaderVariant] = useState<"simple" | "enhanced">("simple")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Header Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={headerVariant === "simple" ? "default" : "outline"}
              onClick={() => setHeaderVariant("simple")}
            >
              Simple Header
            </Button>
            <Button
              variant={headerVariant === "enhanced" ? "default" : "outline"}
              onClick={() => setHeaderVariant("enhanced")}
            >
              Enhanced Header
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            {headerVariant === "simple" ? <Header /> : <EnhancedHeader />}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Simple Header:</strong> Clean, minimal design with basic navigation
            </p>
            <p>
              <strong>Enhanced Header:</strong> More visual hierarchy with tagline and CTA button
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
