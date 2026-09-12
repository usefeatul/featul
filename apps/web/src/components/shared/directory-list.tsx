import Link from "next/link";

export type DirectoryListItem = {
  href: string;
  title: string;
  description?: string;
  meta?: string;
};

function letterOf(title: string) {
  const letter = title.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

function groupByLetter(items: DirectoryListItem[]) {
  const groups = new Map<string, DirectoryListItem[]>();

  for (const item of items) {
    const letter = letterOf(item.title);
    const bucket = groups.get(letter);
    if (bucket) bucket.push(item);
    else groups.set(letter, [item]);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function DirectoryList({
  items,
  idPrefix,
}: {
  items: DirectoryListItem[];
  idPrefix: string;
}) {
  const groups = groupByLetter(items);

  return (
    <div className="space-y-8">
      {groups.map(([letter, entries]) => (
        <section key={letter} aria-labelledby={`${idPrefix}-letter-${letter}`}>
          <h3
            id={`${idPrefix}-letter-${letter}`}
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent"
          >
            {letter}
          </h3>
          <ul className="mt-3 divide-y divide-border/60 border-y border-border/60">
            {entries.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group block py-3">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-base">
                    {item.title}
                    {item.meta ? (
                      <span className="text-[11px] font-medium text-accent">
                        {item.meta}
                      </span>
                    ) : null}
                  </span>
                  {item.description ? (
                    <span className="mt-1 block max-w-2xl text-sm leading-6 text-accent">
                      {item.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
