import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Effortlessly Manage and Access Student Results
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A modern platform for teachers to input marks, calculate grades, and generate report cards. Students can
                securely view their results anytime, anywhere.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/teacher-login">Teacher/Admin Login</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/student-login">Student Login</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/demo">Explore Demo</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[600px] aspect-video overflow-hidden rounded-xl shadow-xl">
              <Image
                src="/placeholder.svg?height=600&width=800"
                width={800}
                height={600}
                alt="Dashboard preview showing a teacher inputting marks"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

