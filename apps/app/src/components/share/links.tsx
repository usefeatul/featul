import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import { buildLinksHtml, type ShareLink } from "@/lib/share";
import CopyButton from "./copy";
import ShareSection from "./section";
import { shareCardClass } from "./styles";

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
      actions={
        <>
          <CopyButton
            text={links.map((link) => `${link.label}: ${link.url}`).join("\n")}
            label="Copy all links"
          />
          <CopyButton text={buildLinksHtml(links)} label="Copy HTML" />
          {links.length < 3 ? (
            <Link
              href={`/workspaces/${slug}/settings/board`}
              className="ml-1 text-xs text-accent hover:text-foreground"
            >
              Show more sections →
            </Link>
          ) : null}
        </>
      }
    >
      <div className={cn(shareCardClass, "divide-y divide-border/50")}>
        {links.map((link) => (
          <div key={link.label} className="flex items-center gap-4 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{link.label}</p>
              <p className="mt-0.5 text-xs text-accent">{link.description}</p>
            </div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.url}
              className="hidden max-w-56 truncate rounded-md bg-muted/40 px-2 py-1 font-mono text-[11px] text-accent hover:text-foreground sm:block dark:bg-white/5"
            >
              {link.url.replace(/^https?:\/\//, "")}
            </a>
            <CopyButton
              text={link.url}
              label={`Copy ${link.label.toLowerCase()} link`}
              iconOnly
            />
          </div>
        ))}
      </div>
    </ShareSection>
  );
}
