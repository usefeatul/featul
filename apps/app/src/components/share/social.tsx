import { cn } from "@featul/ui/lib/utils";
import {
  XBrandIcon,
  LinkedInBrandIcon,
  FacebookBrandIcon,
  RedditBrandIcon,
  ArrowIcon,
} from "@/components/global/icons";
import ShareSection from "./section";

export default function Social({
  name,
  boardUrl,
}: {
  name: string;
  boardUrl: string;
}) {
  const text = `Help shape the future of ${name}. Share an idea or vote on what matters to you.`;
  const networks = [
    {
      name: "X",
      note: "Post to followers",
      icon: XBrandIcon,
      hover: "group-hover:text-foreground",
      href: `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url: boardUrl })}`,
    },
    {
      name: "LinkedIn",
      note: "Share with your network",
      icon: LinkedInBrandIcon,
      hover: "group-hover:text-[#0a66c2] dark:group-hover:text-[#6ba9eb]",
      href: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url: boardUrl })}`,
    },
    {
      name: "Facebook",
      note: "Post to a page or group",
      icon: FacebookBrandIcon,
      hover: "group-hover:text-[#1877f2] dark:group-hover:text-[#75aaff]",
      href: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: boardUrl })}`,
    },
    {
      name: "Reddit",
      note: "Start a thread",
      icon: RedditBrandIcon,
      hover: "group-hover:text-[#ff4500] dark:group-hover:text-[#ff875c]",
      href: `https://www.reddit.com/submit?${new URLSearchParams({ url: boardUrl, title: text })}`,
    },
  ];

  return (
    <ShareSection
      title="Share on social"
      description="Announce your board where your users already are."
      flush
    >
      <ul className="grid grid-cols-2 sm:grid-cols-4">
        {networks.map(
          ({ name: network, note, icon: Icon, hover, href }, index) => (
            <li
              key={network}
              className={cn(
                "border-border/50",
                index % 2 === 1 && "border-l",
                index > 1 && "border-t sm:border-t-0",
                index === 2 && "sm:border-l",
              )}
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${network}`}
                className="group flex h-full flex-col gap-8 px-4 py-5 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="flex items-start justify-between">
                  <Icon
                    className={cn(
                      "size-6 text-muted-foreground transition-colors duration-200",
                      hover,
                    )}
                  />
                  <ArrowIcon className="size-3.5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{network}</span>
                  <span className="mt-0.5 block text-xs text-accent">
                    {note}
                  </span>
                </span>
              </a>
            </li>
          ),
        )}
      </ul>
    </ShareSection>
  );
}
