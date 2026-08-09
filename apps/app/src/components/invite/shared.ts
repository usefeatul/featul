import type { InviteRole } from "@/types/invite";
import { cn } from "@featul/ui/lib/utils";
import type { HTMLMotionProps, Transition } from "framer-motion";

export type InviteMotionProps = Pick<
  HTMLMotionProps<"div">,
  "initial" | "animate" | "exit"
>;

export function getInviteTransition(
  prefersReducedMotion: boolean,
): Transition {
  return prefersReducedMotion
    ? { duration: 0.12 }
    : { duration: 0.26, ease: [0.22, 1, 0.36, 1] };
}

export function getInviteMotionProps(
  prefersReducedMotion: boolean,
): InviteMotionProps {
  return prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 14, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.985 },
      };
}

export function getInviteRoleBadgeClass(role?: InviteRole | null) {
  if (!role) return undefined;

  return cn(
    "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]",
    role === "admin" &&
      "border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
    role === "member" && "border-border/70 bg-muted/40 text-foreground",
    role === "viewer" &&
      "border-sky-500/25 bg-sky-500/8 text-sky-700 dark:text-sky-300",
  );
}
