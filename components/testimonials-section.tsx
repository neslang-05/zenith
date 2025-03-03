import Image from "next/image"
import { Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "This system saved me hours of manual calculations. Generating report cards is now a breeze!",
      name: "Ms. Anika Sharma",
      role: "Math Teacher, ABC School",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      quote: "I love how easy it is to check my results and download them for my parents!",
      name: "Rahul Mehta",
      role: "Student, Grade 10",
      avatar: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Don't just take our word for it. Here's what teachers and students think about Zenith.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col justify-between space-y-6 rounded-lg border p-6 shadow-sm">
              <div className="space-y-4">
                <Quote className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-lg italic">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-full overflow-hidden h-12 w-12">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

