import { cn } from "@featul/ui/lib/utils";
import { StarIcon } from "@featul/ui/icons/star";
import type { DemoRole } from "./data";

const PALETTES = [
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-red-600",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Same avatar service and style the real app uses (see apps/app/src/utils/avatar.ts)
export function demoAvatarUrl(
  seed: string,
  style: "avataaars" | "identicon" | "bottts" | "shapes" = "avataaars"
) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

function badgeColor(role?: DemoRole, isOwner?: boolean) {
  if (isOwner) return "text-primary";
  if (role === "admin") return "text-orange-500";
  if (role === "viewer") return "text-green-500";
  if (role === "member") return "text-blue-500";
  return null;
}

export function DemoAvatar({
  name,
  className,
  role,
  isOwner,
}: {
  name: string;
  className?: string;
  role?: DemoRole;
  isOwner?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = PALETTES[hashString(name) % PALETTES.length];
  const starColor = badgeColor(role, isOwner);

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-6 shrink-0 select-none overflow-visible rounded-full bg-gradient-to-br ring-1 ring-border",
        palette,
        className
      )}
    >
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 flex items-center justify-center text-[inherit] font-semibold text-white">
          {initials}
        </span>
        <img
          src={demoAvatarUrl(name)}
          alt=""
          loading="lazy"
          draggable={false}
          className="relative size-full"
        />
      </span>
      {starColor ? (
        <span className="absolute -bottom-1 -right-1 z-10 rounded-full border border-border bg-card p-0.5">
          <StarIcon className={cn("size-2.5", starColor)} />
        </span>
      ) : null}
    </span>
  );
}
