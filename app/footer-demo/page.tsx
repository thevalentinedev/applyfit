import { FooterDemo } from "@/components/footer-demo"
import { Header } from "@/components/header"

export default function FooterDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-6">Footer Components</h1>
          <FooterDemo />
        </div>
      </main>
    </div>
  )
}
