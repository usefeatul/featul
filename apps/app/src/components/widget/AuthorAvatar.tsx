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
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image || undefined}
        alt=""
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-full border border-white/10 object-cover bg-white/5`}
      />
    );
  }

  return (
    <span
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-[10px] font-medium text-white/70`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
