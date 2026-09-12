import Link from "next/link";
import {
  alternatives as defaultAlternatives,
  type Alternative,
} from "@/config/alternatives";

function letterOf(name: string) {
  const letter = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

function groupByLetter(items: Alternative[]) {
  const groups = new Map<string, Alternative[]>();

  for (const item of items) {
    const letter = letterOf(item.name);
    const bucket = groups.get(letter);
    if (bucket) bucket.push(item);
    else groups.set(letter, [item]);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function AlternativesList({
  items = defaultAlternatives,
}: {
  items?: Alternative[];
}) {
  const groups = groupByLetter(items);

  return (
    <div className="space-y-8">
      {groups.map(([letter, alts]) => (
        <section key={letter} aria-labelledby={`alt-letter-${letter}`}>
          <h3
            id={`alt-letter-${letter}`}
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent"
          >
            {letter}
          </h3>
          <ul className="mt-3 divide-y divide-border/60 border-y border-border/60">
            {alts.map((alt) => (
              <li key={alt.slug}>
                <Link
                  href={`/alternatives/${alt.slug}`}
                  className="group block py-3"
                >
                  <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-base">
                    {alt.name} alternatives
                  </p>
                  {alt.summary ? (
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-accent">
                      {alt.summary}
                    </p>
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
