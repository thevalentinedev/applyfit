"use client"

import { useTheme } from "next-themes"

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" className={className} fill="none">
      {/* Document icon */}
      <rect
        x="10"
        y="5"
        width="30"
        height="40"
        rx="3"
        fill={isDark ? "#1E293B" : "#F9FAFB"}
        stroke={isDark ? "#94A3B8" : "#1E293B"}
        strokeWidth="1.5"
      />
      <path d="M15 15 H35" stroke={isDark ? "#94A3B8" : "#1E293B"} strokeWidth="1.5" />
      <path d="M15 22 H35" stroke={isDark ? "#94A3B8" : "#1E293B"} strokeWidth="1.5" />
      <path d="M15 29 H28" stroke={isDark ? "#94A3B8" : "#1E293B"} strokeWidth="1.5" />

      {/* Green checkmark */}
      <circle cx="30" cy="35" r="8" fill="#34D399" />
      <path d="M26 35 L29 38 L34 32" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Applyfit text */}
      <text
        x="50"
        y="32"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fontWeight="600"
        fill={isDark ? "#F8FAFC" : "#1E293B"}
      >
        Applyfit
      </text>
    </svg>
  )
}
