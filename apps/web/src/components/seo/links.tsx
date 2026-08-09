/**
 * RelatedLinks - Internal linking component for SEO
 *
 * Displays related pages at the bottom of content pages
 * to build the hub-and-spoke internal linking structure.
 */

import Link from "next/link";
import type { RelatedLink } from "@/lib/seo/interlink";

interface Props {
    links: RelatedLink[];
    title?: string;
}

export function RelatedLinks({ links, title = "Related Resources" }: Props) {
    if (links.length === 0) return null;

    return (
        <section className="py-8 md:py-12 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="flex flex-wrap gap-3">
                {links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.href}
                        className="px-4 py-2 rounded-full text-sm border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default RelatedLinks;
