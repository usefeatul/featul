import { Fragment, type ReactNode } from "react";

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={`${part}-${index}`} className="font-medium text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={`${part}-${index}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function Content({ children }: { children: string }) {
  const blocks: ReactNode[] = [];
  const lines = children.split("\n");
  let items: string[] = [];

  const flushItems = () => {
    if (items.length === 0) return;
    const list = items;
    items = [];
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-2 list-disc space-y-1 pl-4">
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>
            <Inline text={item} />
          </li>
        ))}
      </ul>,
    );
  };

  for (const line of lines) {
    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem?.[1]) {
      items.push(listItem[1]);
      continue;
    }

    flushItems();
    const heading = line.match(/^#{1,3}\s+(.+)$/)?.[1];
    if (heading) {
      blocks.push(
        <p key={`heading-${blocks.length}`} className="mb-1 mt-3 font-medium text-foreground">
          <Inline text={heading} />
        </p>,
      );
      continue;
    }

    if (!line.trim()) {
      blocks.push(<span key={`space-${blocks.length}`} className="block h-2" />);
      continue;
    }

    blocks.push(
      <p key={`line-${blocks.length}`}>
        <Inline text={line} />
      </p>,
    );
  }

  flushItems();
  return <div>{blocks}</div>;
}
