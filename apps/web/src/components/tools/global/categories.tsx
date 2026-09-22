import { TOOL_CATEGORIES } from "@/types/tools";
import { DirectoryList } from "@/components/shared/directory-list";

export default function CategoryList() {
  const items = [...TOOL_CATEGORIES]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((category) => ({
      href: `/tools/categories/${category.slug}`,
      title: category.name,
      description: category.description,
      meta: `${category.tools.length} tool${category.tools.length === 1 ? "" : "s"}`,
    }));

  return <DirectoryList idPrefix="tool-category" items={items} />;
}
