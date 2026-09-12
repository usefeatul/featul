import type { ToolItem } from "@/types/tools";
import { isToolNew } from "@/config/toolsFlags";
import { DirectoryList } from "@/components/shared/directory-list";

export default function ToolList({
  categorySlug,
  tools,
}: {
  categorySlug: string;
  tools: ToolItem[];
}) {
  const items = [...tools]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((tool) => ({
      href: `/tools/categories/${categorySlug}/${tool.slug}`,
      title: tool.name,
      description: tool.description,
      meta: tool.isNew || isToolNew(tool.slug) ? "New" : undefined,
    }));

  return <DirectoryList idPrefix="tool" items={items} />;
}
