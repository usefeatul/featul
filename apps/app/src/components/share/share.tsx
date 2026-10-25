import { Button } from "@featul/ui/components/button";
import { DitherClouds } from "@featul/ui/components/clouds";
import { ArrowIcon } from "@/components/global/icons";
import type { ShareLink } from "@/lib/share";
import CopyButton from "./copy";
import WebsiteLinks from "./links";
import Signature from "./signature";
import Messages from "./messages";
import Embed from "./embed";
import Social from "./social";
import BoardPreview, { type PreviewPost } from "./preview";
import ShareSection from "./section";

export default function Share({
  workspaceId,
  name,
  slug,
  boardUrl,
  userName,
  userImage,
  logo,
  topPosts,
  links,
}: {
  workspaceId: string;
  name: string;
  slug: string;
  boardUrl: string;
  userName: string;
  userImage?: string | null;
  logo?: string | null;
  topPosts: PreviewPost[];
  links: ShareLink[];
}) {
  const displayUrl = boardUrl.replace(/^https?:\/\//, "");
  const liveBadge = (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
        <span className="relative size-1.5 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-12 pt-2 sm:pt-4">
      <header>
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
          Share
        </h2>
        <p className="mt-1 text-sm text-accent">
          Everything you need to bring users to your {name} board.
        </p>
      </header>

      <ShareSection title="Public board" badge={liveBadge} flush>
        <div className="grid gap-2 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col p-4 sm:p-5">
            <p className="text-base font-medium">Your {name} board</p>
            <p className="mt-1 text-sm leading-6 text-accent">
              The home for every idea, vote, and update. Put it wherever your
              users already are.
            </p>
            <a
              href={boardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-fit max-w-full truncate text-xs text-primary underline-offset-4 hover:underline"
            >
              {displayUrl}
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
            className="relative isolate flex min-h-56 items-end overflow-hidden rounded-xl bg-primary px-5 pt-6 ring-1 ring-inset ring-black/5 sm:px-6 sm:pt-7 dark:ring-white/10"
          >
            <div className="absolute inset-0 -z-10">
              <DitherClouds primary fit="cover" />
            </div>
            <BoardPreview
              name={name}
              logo={logo}
              displayUrl={displayUrl}
              posts={topPosts}
            />
          </div>
        </div>
      </ShareSection>

      <Social name={name} boardUrl={boardUrl} />

      <Signature
        name={name}
        userName={userName}
        logo={logo}
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
