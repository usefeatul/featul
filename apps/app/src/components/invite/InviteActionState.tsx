import { cn } from "@featul/ui/lib/utils";
import { motion } from "framer-motion";
import { Check, LoaderCircle, X } from "lucide-react";
import {
  getInviteMotionProps,
  getInviteTransition,
} from "@/components/invite/invite-shared";

type Props = {
  screen: "accepting" | "declining" | "accepted" | "declined";
  workspaceName: string | null;
  prefersReducedMotion: boolean;
};

export default function InviteActionState({
  screen,
  workspaceName,
  prefersReducedMotion,
}: Props) {
  const transition = getInviteTransition(prefersReducedMotion);
  const motionProps = getInviteMotionProps(prefersReducedMotion);
  const isPending = screen === "accepting" || screen === "declining";
  const isAccepting = screen === "accepting";
  const isAccepted = screen === "accepted";

  return (
    <motion.div
      key={screen}
      {...motionProps}
      transition={transition}
      className="flex flex-col items-center py-4 text-center"
    >
      <motion.div
        initial={
          prefersReducedMotion
            ? false
            : { scale: isPending ? 0.96 : 0.88, opacity: isPending ? 0.7 : 0 }
        }
        animate={
          prefersReducedMotion
            ? undefined
            : isPending
              ? { scale: [0.96, 1, 0.96], opacity: 1 }
              : { scale: 1, opacity: 1 }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : isPending
              ? { duration: 1.2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
              : transition
        }
        className={cn(
          "flex items-center justify-center rounded-md border",
          isPending ? "size-14" : "size-16",
          isAccepting && "border-primary/20 bg-primary/8 text-primary",
          screen === "declining" && "border-border/70 bg-muted/50 text-foreground",
          isAccepted &&
            "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
          screen === "declined" && "border-border/70 bg-muted/50 text-foreground",
        )}
      >
        {isPending ? (
          <LoaderCircle className="size-6 animate-spin" />
        ) : isAccepted ? (
          <Check className="size-7" />
        ) : (
          <X className="size-7" />
        )}
      </motion.div>

      <h2
        className={cn(
          "mt-6 font-semibold tracking-[-0.03em] text-foreground",
          isPending ? "text-2xl" : "text-3xl",
        )}
      >
        {screen === "accepting" && "Accepting invite"}
        {screen === "declining" && "Declining invite"}
        {screen === "accepted" && "You’re in"}
        {screen === "declined" && "Invite declined"}
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-accent">
        {screen === "accepting" &&
          `Getting ${workspaceName || "your workspace"} ready for you.`}
        {screen === "declining" &&
          "Closing this invite and updating your access."}
        {screen === "accepted" &&
          `Opening ${workspaceName || "your workspace"} now.`}
        {screen === "declined" &&
          "You won’t be added to this workspace. Taking you back now."}
      </p>
    </motion.div>
  );
}
