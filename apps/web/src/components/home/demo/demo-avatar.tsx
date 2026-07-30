import { cn } from "@featul/ui/lib/utils";

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

export function DemoAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = PALETTES[hashString(name) % PALETTES.length];

  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-6 shrink-0 select-none overflow-hidden rounded-full bg-gradient-to-br ring-1 ring-border",
        palette,
        className
      )}
    >
      {/* Initials show while the avatar image loads (or if it fails) */}
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
  );
}
