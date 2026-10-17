import Link from "next/link";
import { ExternalLink } from "@/components/global/icons";
import { buildLinksHtml, type ShareLink } from "@/lib/share";
import ShareCard from "./card";
import CopyButton from "./copy";

export default function WebsiteLinks({
  links,
  slug,
}: {
  links: ShareLink[];
  slug: string;
}) {
  return (
    <ShareCard
      title="In your app or website"
      description="Give feedback a home in your menu, footer, or docs."
      footer={
        <>
          <CopyButton text={buildLinksHtml(links)} label="Copy HTML" />
          <CopyButton
            text={links.map((link) => `${link.label}: ${link.url}`).join("\n")}
            label="Copy all links"
          />
        </>
      }
    >
      <div className="space-y-4">
        {links.map((link) => (
          <div key={link.label} className="flex min-w-0 items-center gap-3">
            <div className="min-w-0 flex-1">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-xs font-medium hover:text-primary"
              >
                {link.label}
                <ExternalLink className="size-3 text-accent group-hover:text-primary" />
              </a>
              <p
                className="mt-0.5 truncate text-[11px] text-accent"
                title={link.url}
              >
                {link.url.replace(/^https?:\/\//, "")}
              </p>
            </div>
            <CopyButton
              text={link.url}
              label={`Copy ${link.label.toLowerCase()} link`}
              iconOnly
            />
          </div>
        ))}
        {links.length < 3 ? (
          <Link
            href={`/workspaces/${slug}/settings/board`}
            className="inline-block text-xs text-accent hover:text-foreground"
          >
            Manage public sections →
          </Link>
        ) : null}
      </div>
    </ShareCard>
  );
}
