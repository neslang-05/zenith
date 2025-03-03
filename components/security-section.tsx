import { Shield } from "lucide-react"

export function SecuritySection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="inline-block rounded-full bg-primary/10 p-3">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Your Data is Safe With Us</h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
              All student records and results are encrypted and stored securely. We comply with data protection
              standards to ensure confidentiality.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

