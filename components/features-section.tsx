import { PenLine, Eye, ShieldCheck, FileText } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <PenLine className="h-10 w-10 text-blue-500" />,
      title: "Easy Marks Entry",
      description:
        "Input marks for multiple subjects in one go. Automatically calculate totals, percentages, and grades.",
    },
    {
      icon: <Eye className="h-10 w-10 text-green-500" />,
      title: "Instant Access to Results",
      description: "View your grades, download report cards, and track progress securely.",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-purple-500" />,
      title: "Role-Based Access",
      description: "Teachers and students have separate dashboards with encrypted authentication.",
    },
    {
      icon: <FileText className="h-10 w-10 text-amber-500" />,
      title: "PDF Report Cards",
      description: "Generate and download professional report cards in one click.",
    },
  ]

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Our System?</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Zenith provides powerful tools for both teachers and students to manage academic results efficiently.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-2 rounded-full bg-background">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

