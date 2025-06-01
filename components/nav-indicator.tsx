"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavIndicatorProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavIndicator({ href, children, className }: NavIndicatorProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <div className={cn("relative", className)}>
      {children}
      {isActive && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />}
    </div>
  )
}
