import type React from "react"
interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1 className={`scroll-m-20 text-4xl font-heading font-extrabold tracking-tight lg:text-5xl ${className}`}>
      {children}
    </h1>
  )
}

export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 className={`scroll-m-20 text-3xl font-heading font-semibold tracking-tight first:mt-0 ${className}`}>
      {children}
    </h2>
  )
}

export function TypographyH3({ children, className }: TypographyProps) {
  return <h3 className={`scroll-m-20 text-2xl font-heading font-semibold tracking-tight ${className}`}>{children}</h3>
}

export function TypographyH4({ children, className }: TypographyProps) {
  return <h4 className={`scroll-m-20 text-xl font-heading font-semibold tracking-tight ${className}`}>{children}</h4>
}

export function TypographyP({ children, className }: TypographyProps) {
  return <p className={`leading-7 font-body [&:not(:first-child)]:mt-6 ${className}`}>{children}</p>
}

export function TypographyLead({ children, className }: TypographyProps) {
  return <p className={`text-xl font-body text-muted-foreground ${className}`}>{children}</p>
}

export function TypographyLarge({ children, className }: TypographyProps) {
  return <div className={`text-lg font-body font-semibold ${className}`}>{children}</div>
}

export function TypographySmall({ children, className }: TypographyProps) {
  return <small className={`text-sm font-body font-medium leading-none ${className}`}>{children}</small>
}

export function TypographyMuted({ children, className }: TypographyProps) {
  return <p className={`text-sm font-body text-muted-foreground ${className}`}>{children}</p>
}
