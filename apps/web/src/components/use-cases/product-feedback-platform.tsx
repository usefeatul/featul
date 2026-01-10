import Link from "next/link"

export function ProductFeedbackUseCase() {
  return (
    <article className="mx-auto w-full max-w-3xl py-16 md:py-24">
      <header className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Use case</p>
        <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
          Centralize product feedback and roadmap in one place
        </h1>
        <p className="text-accent mt-4">
          Learn how product organizations use featul to establish a single, reliable source of feedback truth, apply
          structured prioritization, and communicate decisions back to customers in a predictable and professional way.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Before featul vs after featul</h2>
        <p className="text-accent">
          Many teams begin with feedback distributed across multiple fragmented systems: support tickets, ad‑hoc Slack
          threads, spreadsheets maintained by individual contributors, and informal comments in community spaces. In
          this environment, it becomes difficult to understand which requests are most common, which customers are
          affected, and how feedback should influence the roadmap.
        </p>
        <p className="text-accent">
          With featul, feedback, roadmap, and changelog are managed together within a single workspace. Product teams
          gain a consolidated view of demand, can clearly explain why certain initiatives are prioritized, and can
          demonstrate both internally and externally how customer input directly shapes product decisions.
        </p>
      </section>

      <section className="space-y-4 mt-10">
        <h2 className="text-xl font-semibold">1. Capture feedback from every channel</h2>
        <p className="text-accent">
          Start by ensuring that all relevant channels feed into a single, consistent destination. With featul, you can
          bring feedback from in‑app widgets, email, support tools, and community spaces into a central feedback hub
          instead of allowing each channel to develop its own separate backlog.
        </p>
        <p className="text-accent">
          Once feedback is centralized, your team no longer needs to reconcile separate spreadsheets or search through
          historical tickets to understand customer needs. Everyone works from the same structured view, with the
          ability to filter by segment, product area, or importance, which leads to more deliberate and accountable
          decision‑making.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">2. Prioritize with a transparent roadmap</h2>
        <p className="text-accent">
          When feedback is grouped into clear themes, it becomes easier to assess impact and urgency. featul enables
          teams to consolidate related requests into structured ideas, estimate the value and effort involved, and then
          convert those ideas into roadmap items that can be tracked over time.
        </p>
        <p className="text-accent">
          A public or shared roadmap gives all stakeholders customers, customer success, sales, and leadership a single
          reference point for what is planned, in progress, and recently delivered. This reduces ad‑hoc status
          requests, supports more transparent expectation‑setting, and helps internal teams speak with a consistent,
          aligned message.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">3. Close the loop with changelogs</h2>
        <p className="text-accent">
          When a feature ships, the work is not finished until customers clearly understand what has changed and how it
          relates to their earlier requests. With featul, you can link releases back to their originating feedback,
          record the status change, and notify the customers and internal teams that were following a given item.
        </p>
        <p className="text-accent">
          Over time, this consistent “closed loop” communication builds trust. Customers begin to see that submitting
          feedback has a real effect, which increases engagement and turns previously silent users into active
          collaborators in your product development process.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Example scenario</h2>
        <p className="text-accent">
          Consider a B2B SaaS team that repeatedly hears requests for more advanced analytics capabilities. Some
          requests are raised by enterprise accounts through their customer success managers, while others surface from
          smaller customers via an in‑app feedback widget and periodic NPS surveys.
        </p>
        <p className="text-accent">
          Using featul, the team groups all analytics‑related feedback into a single idea, attaches internal notes,
          quantifies the number and type of customers affected, and evaluates the strategic impact. Once the work is
          prioritized, the idea is moved to “Planned” on the roadmap. Customers can subscribe to updates, and when the
          new analytics release ships, they automatically receive a clear changelog entry that explains what was
          delivered and why.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Who this use case is for</h2>
        <p className="text-accent">
          This workflow is particularly well‑suited to SaaS teams that want a structured, privacy‑first way to manage
          feedback at scale while still maintaining a clear, human connection with their customers. It works especially
          well for organizations that are moving from informal processes to a more deliberate, product‑led operating
          model.
        </p>
        <ul className="text-accent ml-5 list-disc space-y-1">
          <li>Replace scattered feedback documents and spreadsheets with a single, auditable source of truth</li>
          <li>Align product, success, sales, and leadership around one shared roadmap and prioritization model</li>
          <li>Reduce manual status updates and follow‑ups while still providing timely, professional communication</li>
          <li>Demonstrate a clear, EU‑hosted, GDPR‑friendly feedback process to security‑conscious customers</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Get started with featul</h2>
        <p className="text-accent">
          If you are ready to centralize product feedback and make roadmap decisions with greater confidence, a practical
          first step is to create your initial board, define a small number of clear categories, and invite the core
          members of your product, success, and support teams. From there, you can gradually connect additional feedback
          channels and formalize how ideas move from intake to delivery.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">
            View pricing
          </Link>
          <Link href="/docs" className="text-accent underline-offset-4 hover:underline">
            Read the docs
          </Link>
          <Link href="/tools" className="text-accent underline-offset-4 hover:underline">
            Explore free product tools
          </Link>
        </div>
      </section>
    </article>
  )
}
