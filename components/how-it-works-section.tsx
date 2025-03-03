import { LogIn, ClipboardList, Bell } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: <LogIn className="h-10 w-10 text-blue-500" />,
      title: "Login Securely",
      description: "Teachers: Use your admin credentials. Students: Enter your roll number and password.",
    },
    {
      icon: <ClipboardList className="h-10 w-10 text-blue-500" />,
      title: "Manage or View Results",
      description:
        "Teachers: Add students, input marks, and generate reports. Students: Check grades and download PDFs.",
    },
    {
      icon: <Bell className="h-10 w-10 text-blue-500" />,
      title: "Stay Updated",
      description: "Receive notifications when new results are published (optional).",
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple Steps to Get Started</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Getting started with Zenith is easy. Follow these simple steps to begin managing or viewing results.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                {index + 1}
              </div>
              <div className="pt-4">{step.icon}</div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

