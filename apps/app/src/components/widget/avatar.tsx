"use client";

import * as React from "react";
import { getInitials } from "@/utils/user";
import { cn } from "@featul/ui/lib/utils";

type Props = {
  name: string;
  image?: string | null;
  className?: string;
};

const widgetAvatarShellClass =
  "relative inline-flex shrink-0 overflow-visible rounded-full border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-shell))] after:pointer-events-none after:absolute after:inset-px after:rounded-full after:ring-1 after:ring-[rgb(var(--widget-fg)/0.1)] after:ring-inset";

const widgetAvatarInnerClass =
  "size-full overflow-hidden rounded-full bg-[rgb(var(--widget-fg)/0.08)]";

export function WidgetAuthorAvatar({ name, image, className = "size-6" }: Props) {
  const [failed, setFailed] = React.useState(false);
  const initials = getInitials(name || "Guest");
  const showImage = Boolean(image) && !failed;

  React.useEffect(() => {
    setFailed(false);
  }, [image]);

  return (
    <span className={cn(widgetAvatarShellClass, className)} aria-hidden>
      {showImage ? (
        <img
          src={image || undefined}
          alt=""
          onError={() => setFailed(true)}
          className={`${widgetAvatarInnerClass} object-cover`}
        />
      ) : (
        <span
          className={`${widgetAvatarInnerClass} inline-flex items-center justify-center text-[11px] font-medium text-[rgb(var(--widget-fg)/0.7)]`}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
