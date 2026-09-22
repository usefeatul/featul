/**
 * RelatedLinks - Internal linking component for SEO
 *
 * Displays related pages at the bottom of content pages
 * to build the hub-and-spoke internal linking structure.
 */

import Link from "next/link";
import type { RelatedLink } from "@/lib/seo/interlink";
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card";

interface Props {
    links: RelatedLink[];
    title?: string;
}

export function RelatedLinks({ links, title = "Related Resources" }: Props) {
    if (links.length === 0) return null;

    return (
        <section className="py-8 md:py-12 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                {links.map((link, i) => (
                    <Link key={i} href={link.href} className="group block">
                        <OverlayCard>
                            <OverlayCardPanel className="px-4 py-3">
                                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                                    {link.label}
                                </span>
                            </OverlayCardPanel>
                        </OverlayCard>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default RelatedLinks;
