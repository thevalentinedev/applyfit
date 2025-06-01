import { HeaderDemo } from "@/components/header-demo"
import { Header } from "@/components/header"

export default function HeaderDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-6">Header Components</h1>
          <HeaderDemo />
        </div>
      </main>
    </div>
  )
}
