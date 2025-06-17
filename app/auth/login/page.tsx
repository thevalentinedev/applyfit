import { EnhancedLoginForm } from "@/components/auth/enhanced-login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <EnhancedLoginForm />
      </div>
    </div>
  )
}
