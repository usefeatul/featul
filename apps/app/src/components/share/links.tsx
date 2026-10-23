import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import {
  ArrowIcon,
  ChangelogIcon,
  CollectIcon,
  Plus,
  RoadmapIcon,
} from "@/components/global/icons";
import type { ShareLink } from "@/lib/share";
import CopyButton from "./copy";
import ShareSection from "./section";

const linkIcons = {
  Feedback: CollectIcon,
  Roadmap: RoadmapIcon,
  Changelog: ChangelogIcon,
} as const;

export default function WebsiteLinks({
  links,
  slug,
}: {
  links: ShareLink[];
  slug: string;
}) {
  return (
    <ShareSection
      title="Links for your app or website"
      description="Add them to your help menu, footer, or docs once and keep collecting."
      flush
    >
      <ul className="divide-y divide-border/50 dark:divide-white/[0.06]">
        {links.map((link) => {
          const Icon =
            linkIcons[link.label as keyof typeof linkIcons] ?? CollectIcon;
          const displayUrl = link.url.replace(/^https?:\/\//, "");
          return (
            <li
              key={link.label}
              className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-muted/30 sm:px-5 dark:hover:bg-white/[0.02]"
            >
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-accent dark:border-white/8 dark:bg-white/5"
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{link.label}</p>
                <p className="mt-0.5 truncate text-xs text-accent">
                  <span className="sm:hidden">{displayUrl}</span>
                  <span className="hidden sm:inline">{link.description}</span>
                </p>
              </div>
              <span
                title={link.url}
                className="hidden max-w-64 truncate font-mono text-xs text-accent sm:block"
              >
                {displayUrl}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button variant="card" size="icon-sm" asChild>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${link.label.toLowerCase()}`}
                    title={`Open ${link.label.toLowerCase()}`}
                  >
                    <ArrowIcon className="size-3.5" />
                  </a>
                </Button>
                <CopyButton
                  text={link.url}
                  label={`Copy ${link.label.toLowerCase()} link`}
                  iconOnly
                />
              </div>
            </li>
          );
        })}
        {links.length < 3 ? (
          <li>
            <Link
              href={`/workspaces/${slug}/settings/board`}
              className="flex items-center gap-3.5 px-4 py-3 text-xs text-accent transition-colors hover:bg-muted/30 hover:text-foreground sm:px-5 dark:hover:bg-white/[0.02]"
            >
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border dark:border-white/15"
              >
                <Plus className="size-4" />
              </span>
              Turn on your roadmap or changelog to share them here
            </Link>
          </li>
        ) : null}
      </ul>
    </ShareSection>
  );
}
