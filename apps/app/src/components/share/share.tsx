import { Button } from "@featul/ui/components/button";
import { DitherClouds } from "@featul/ui/components/clouds";
import { cn } from "@featul/ui/lib/utils";
import {
  XBrandIcon,
  LinkedInBrandIcon,
  FacebookBrandIcon,
  RedditBrandIcon,
  ArrowIcon,
  Link2,
} from "@/components/global/icons";
import type { ShareLink } from "@/lib/share";
import CopyButton from "./copy";
import WebsiteLinks from "./links";
import Signature from "./signature";
import Messages from "./messages";
import Embed from "./embed";
import ShareSection from "./section";
import { shareCardClass } from "./styles";

export default function Share({
  workspaceId,
  name,
  slug,
  boardUrl,
  userName,
  userImage,
  links,
}: {
  workspaceId: string;
  name: string;
  slug: string;
  boardUrl: string;
  userName: string;
  userImage?: string | null;
  links: ShareLink[];
}) {
  const socialText = `Help shape the future of ${name}. Share an idea or vote on what matters to you.`;
  const social = [
    {
      name: "X",
      description: "Post to your followers.",
      icon: XBrandIcon,
      color: "text-foreground",
      href: `https://twitter.com/intent/tweet?${new URLSearchParams({ text: socialText, url: boardUrl })}`,
    },
    {
      name: "LinkedIn",
      description: "Share with your network.",
      icon: LinkedInBrandIcon,
      color: "text-[#0a66c2] dark:text-[#6ba9eb]",
      href: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url: boardUrl })}`,
    },
    {
      name: "Facebook",
      description: "Post to a page or group.",
      icon: FacebookBrandIcon,
      color: "text-[#1877f2] dark:text-[#75aaff]",
      href: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: boardUrl })}`,
    },
    {
      name: "Reddit",
      description: "Share in a subreddit.",
      icon: RedditBrandIcon,
      color: "text-[#d93900] dark:text-[#ff875c]",
      href: `https://www.reddit.com/submit?${new URLSearchParams({ url: boardUrl, title: socialText })}`,
    },
  ];
  const displayUrl = boardUrl.replace(/^https?:\/\//, "");

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-1 pb-12 pt-2 sm:pt-4">
      <header>
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
          Share
        </h2>
        <p className="mt-1 text-sm text-accent">
          Everything you need to bring users to your {name} board.
        </p>
      </header>

      <section
        aria-label="Your public board"
        className={cn(
          shareCardClass,
          "grid gap-2 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]",
        )}
      >
        <div className="flex flex-col p-4 sm:p-5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
          <p className="mt-3 text-base font-medium">Your {name} board</p>
          <p className="mt-1 text-sm leading-6 text-accent">
            The home for every idea, vote, and update. Put it wherever your
            users already are.
          </p>
          <a
            href={boardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-fit max-w-full items-center gap-1.5 text-xs text-accent hover:text-foreground"
          >
            <Link2 className="size-3.5 shrink-0" />
            <span className="truncate">{displayUrl}</span>
          </a>
          <div className="mt-auto flex items-center gap-2 pt-5">
            <CopyButton text={boardUrl} label="Copy link" primary />
            <Button variant="card" size="sm" asChild>
              <a href={boardUrl} target="_blank" rel="noopener noreferrer">
                Visit <ArrowIcon className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>
        <div
          aria-hidden
          className="relative min-h-40 overflow-hidden rounded-xl bg-primary ring-1 ring-inset ring-black/5 dark:ring-white/10"
        >
          <DitherClouds multicolor fit="cover" />
        </div>
      </section>

      <ShareSection
        title="Announce it"
        description="One click opens a ready-to-post share on each network."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {social.map(({ name: platform, icon: Icon, color, href }) => (
            <a
              key={platform}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${platform}`}
              className={cn(
                shareCardClass,
                "group flex flex-col gap-6 p-4 transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:border-white/15",
              )}
            >
              <span className="flex items-start justify-between">
                <Icon className={cn("size-6", color)} />
                <ArrowIcon className="size-3.5 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </span>
              <span className="text-sm font-medium">{platform}</span>
            </a>
          ))}
        </div>
      </ShareSection>

      <Signature
        name={name}
        userName={userName}
        userImage={userImage}
        boardUrl={boardUrl}
      />

      <WebsiteLinks links={links} slug={slug} />

      <Messages
        key={boardUrl}
        name={name}
        boardUrl={boardUrl}
        userName={userName}
        userImage={userImage}
      />

      <Embed name={name} workspaceId={workspaceId} slug={slug} />
    </div>
  );
}
