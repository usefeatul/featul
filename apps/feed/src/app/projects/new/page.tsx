import type { Metadata } from "next"
import CreateProjectForm from "@/components/projects/CreateForm"

export const metadata: Metadata = {
  title: "New Project",
  description: "Create a new project in Feedgot.",
  alternates: { canonical: "/projects/new" },
  robots: { index: false, follow: false },
}

export default function NewProjectPage() {
  return (
    <section className="min-h-screen flex items-center">
      <div className="w-full">
        <CreateProjectForm />
      </div>
    </section>
  )
}
