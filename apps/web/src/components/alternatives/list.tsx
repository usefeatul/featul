import {
  alternatives as defaultAlternatives,
  type Alternative,
} from "@/config/alternatives";
import { DirectoryList } from "@/components/shared/directory-list";

export default function AlternativesList({
  items = defaultAlternatives,
}: {
  items?: Alternative[];
}) {
  return (
    <DirectoryList
      idPrefix="alt"
      items={items.map((alt) => ({
        href: `/alternatives/${alt.slug}`,
        title: `${alt.name} alternatives`,
        description: alt.summary,
      }))}
    />
  );
}
