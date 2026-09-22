import type { UseCaseItem } from "@/types/scenarios";
import { DirectoryList } from "@/components/shared/directory-list";

export default function UseCasesList({ items }: { items: UseCaseItem[] }) {
  return (
    <DirectoryList
      idPrefix="use-case"
      items={items.map((useCase) => ({
        href: `/use-cases/${useCase.slug}`,
        title: useCase.cardTitle ?? useCase.name,
        description: useCase.cardDescription ?? useCase.description,
        meta: useCase.badge,
      }))}
    />
  );
}
