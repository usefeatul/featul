import { SkyPageShell } from "@/components/layout/shell";
import { DirectoryList } from "@/components/shared/directory-list";
import type { Definition } from "@/types/definitions";

export default function DefinitionsIndex({ items }: { items: Definition[] }) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SkyPageShell
      dataComponent="DefinitionsIndex"
      eyebrow={`Glossary • ${sorted.length} terms`}
      title="SaaS Metrics Encyclopedia"
      description="Short, practical definitions with formulas and examples. Each term links to tools and related concepts."
    >
      <DirectoryList
        idPrefix="definition"
        items={sorted.map((definition) => ({
          href: `/definitions/${definition.slug}`,
          title: definition.name,
          description: definition.short,
        }))}
      />
    </SkyPageShell>
  );
}
