import { Button } from "@featul/ui/components/button";
import { DitherClouds } from "@featul/ui/components/clouds";
import { cn } from "@featul/ui/lib/utils";
import { ArrowIcon, Link2 } from "@/components/global/icons";
import type { ShareLink } from "@/lib/share";
import CopyButton from "./copy";
import WebsiteLinks from "./links";
import Signature from "./signature";
import Messages from "./messages";
import Embed from "./embed";
import Social from "./social";
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
          <DitherClouds primary fit="cover" />
        </div>
      </section>

      <Social name={name} boardUrl={boardUrl} />

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
