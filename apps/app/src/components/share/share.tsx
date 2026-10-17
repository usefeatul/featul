import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import {
  XBrandIcon,
  LinkedInBrandIcon,
  FacebookBrandIcon,
  RedditBrandIcon,
  ExternalLink,
  Link2,
  ArrowIcon,
} from "@/components/global/icons";
import type { ShareLink } from "@/lib/share";
import CopyButton from "./copy";
import ShareTabs from "./tabs";
import WebsiteLinks from "./links";
import Signature from "./signature";
import Messages from "./messages";
import Embed from "./embed";
import { shareCardClass } from "./styles";

export default function Share({
  workspaceId,
  name,
  slug,
  boardUrl,
  userName,
  links,
}: {
  workspaceId: string;
  name: string;
  slug: string;
  boardUrl: string;
  userName: string;
  links: ShareLink[];
}) {
  const socialText = `Help shape the future of ${name}. Share an idea or vote on what matters to you.`;
  const social = [
    {
      name: "X",
      description: "Start a conversation with your followers.",
      icon: XBrandIcon,
      color: "text-foreground",
      href: `https://twitter.com/intent/tweet?${new URLSearchParams({ text: socialText, url: boardUrl })}`,
    },
    {
      name: "LinkedIn",
      description: "Invite your professional network to contribute.",
      icon: LinkedInBrandIcon,
      color: "text-[#0a66c2] dark:text-[#6ba9eb]",
      href: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url: boardUrl })}`,
    },
    {
      name: "Facebook",
      description: "Bring your page or group into the conversation.",
      icon: FacebookBrandIcon,
      color: "text-[#1877f2] dark:text-[#75aaff]",
      href: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: boardUrl })}`,
    },
    {
      name: "Reddit",
      description: "Gather ideas from your community.",
      icon: RedditBrandIcon,
      color: "text-[#d93900] dark:text-[#ff875c]",
      href: `https://www.reddit.com/submit?${new URLSearchParams({ url: boardUrl, title: socialText })}`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-7 py-7 sm:py-10">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Share your workspace
          </h2>
          <p className="mt-1.5 text-sm text-accent">
            Bring your users into the conversation.
          </p>
          <a
            href={boardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex max-w-full items-center gap-1.5 break-all text-xs text-accent hover:text-foreground"
          >
            <Link2 className="size-3.5 shrink-0" />
            {boardUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="card" size="sm" asChild>
            <a href={boardUrl} target="_blank" rel="noopener noreferrer">
              Open board <ExternalLink className="size-3.5" />
            </a>
          </Button>
          <CopyButton text={boardUrl} label="Copy board link" primary />
        </div>
      </header>

      <ShareTabs
        share={
          <div className="space-y-7">
            <section
              aria-label="Social channels"
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {social.map(
                ({ name: platform, description, icon: Icon, color, href }) => (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${platform}`}
                    className={cn(
                      shareCardClass,
                      "group flex flex-col transition-colors hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <div className="flex flex-1 items-start gap-3 p-4">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background/60",
                          color,
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-medium">{platform}</h3>
                        <p className="mt-1 text-xs leading-5 text-accent">
                          {description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/35 px-4 py-2.5 text-xs font-medium text-accent group-hover:text-foreground">
                      <span>Share on {platform}</span>
                      <ArrowIcon className="size-3.5" />
                    </div>
                  </a>
                ),
              )}
            </section>
            <div className="grid gap-4 md:grid-cols-2">
              <WebsiteLinks links={links} slug={slug} />
              <Signature name={name} userName={userName} boardUrl={boardUrl} />
            </div>
          </div>
        }
        messages={<Messages key={boardUrl} name={name} boardUrl={boardUrl} />}
        embed={<Embed workspaceId={workspaceId} slug={slug} />}
      />
    </div>
  );
}
