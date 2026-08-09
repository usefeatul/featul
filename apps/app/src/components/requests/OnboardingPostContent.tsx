"use client";

import React from "react";
import { cn } from "@featul/ui/lib/utils";
import { parseOnboardingContent } from "@/lib/onboarding/post";

type OnboardingPostContentProps = {
  content: string;
  className?: string;
};

export function OnboardingPostContent({
  content,
  className,
}: OnboardingPostContentProps) {
  const blocks = React.useMemo(() => parseOnboardingContent(content), [content]);

  return (
    <div
      className={cn(
        "prose text-sm text-accent dark:prose-invert wrap-break-word leading-6 min-w-0 space-y-4",
        className,
      )}
    >
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return <p key={index}>{block.text}</p>;
        }

        return (
          <div key={index} className="space-y-2 not-prose">
            {block.title ? (
              <p className="text-sm font-medium text-foreground">{block.title}</p>
            ) : null}
            <ul className="space-y-1.5 text-sm leading-6 text-accent">
              {block.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span
                    aria-hidden
                    className="mt-2.5 size-1 shrink-0 rounded-full bg-foreground/35"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
