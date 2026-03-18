import type { ReactNode } from "react"
import { Container } from "@/components/global/container"

type ToolsPageShellProps = {
  children: ReactNode
  dataComponent?: string
  mainClassName?: string
  sectionClassName?: string
}

export default function ToolsPageShell({
  children,
  dataComponent,
  mainClassName = "min-[height:calc(100vh-64px)] pt-16 bg-background",
  sectionClassName = "py-8 sm:py-12",
}: ToolsPageShellProps) {
  return (
    <main className={mainClassName}>
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <section className={sectionClassName} data-component={dataComponent}>
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">{children}</div>
        </section>
      </Container>
    </main>
  )
}
