"use client";

import * as React from "react";
import { getInitials } from "@/utils/user";

type Props = {
  name: string;
  image?: string | null;
  className?: string;
};

export function WidgetAuthorAvatar({ name, image, className = "size-6" }: Props) {
  const [failed, setFailed] = React.useState(false);
  const initials = getInitials(name || "Guest");
  const showImage = Boolean(image) && !failed;

  React.useEffect(() => {
    setFailed(false);
  }, [image]);

  if (showImage) {
    return (
      <img
        src={image || undefined}
        alt=""
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-full border border-[rgb(var(--widget-fg)/0.1)] object-cover bg-[rgb(var(--widget-fg)/0.05)]`}
      />
    );
  }

  return (
    <span
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-full border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.08)] text-[11px] font-medium text-[rgb(var(--widget-fg)/0.7)]`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
