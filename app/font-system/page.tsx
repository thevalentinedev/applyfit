import { FontShowcase } from "@/components/font-showcase"
import { Header } from "@/components/header"

export default function FontSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-6">Applyfit Font System</h1>
          <div className="bg-card rounded-xl shadow-md border p-8">
            <FontShowcase />
          </div>
        </div>
      </main>
    </div>
  )
}
