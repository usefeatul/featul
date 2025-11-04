import type { ToolItem, ToolContentSection } from '@/types/tools'

export default function ToolTemplate({ tool }: { tool: ToolItem }) {
  const sections: ToolContentSection[] = tool.contentSections ?? []
  return (
    <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
      {sections.length === 0 ? (
        <p>Coming soon.</p>
      ) : (
        sections.map((s, i) => (
          <section key={i} className="mb-6">
            {s.title && <h2>{s.title}</h2>}
            {s.body && <p>{s.body}</p>}
            {s.code && (
              <pre>
                <code>{s.code}</code>
              </pre>
            )}
          </section>
        ))
      )}
    </div>
  )
}