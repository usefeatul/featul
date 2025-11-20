import type { Metadata } from "next"
import CreateProjectForm from "@/components/workspaces/CreateForm"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "New Project",
  description: "Create a new project in Feedgot.",
  path: "/workspace/new",
  indexable: false,
})

export default function NewWorkspacePage() {
  return (
    <section className="min-h-screen flex items-center">
      <div className="w-full">
        <CreateProjectForm />
      </div>
    </section>
  )
}
