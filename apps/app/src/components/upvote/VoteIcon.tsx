import { motion, AnimatePresence } from "framer-motion";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@featul/ui/lib/utils";

interface VoteIconProps {
  hasVoted: boolean;
  direction?: "up" | "down";
}

export function VoteIcon({ hasVoted, direction = "up" }: VoteIconProps) {
  const Icon = direction === "down" ? ArrowBigDown : ArrowBigUp;

  return (
    <span className="relative inline-flex items-center">
      <motion.span
        key={`${direction}-${hasVoted ? "selected" : "not-selected"}`}
        animate={{
          scale: hasVoted ? [1, 1.2, 1] : [1, 0.95, 1],
          y: hasVoted ? [0, direction === "up" ? -2 : 2, 0] : 0,
        }}
        transition={{ duration: 0.25 }}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            !hasVoted && "group-hover/vote:scale-110 transition-transform"
          )}
          fill={hasVoted ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </motion.span>
      <AnimatePresence>
        {hasVoted && (
          <>
            <motion.span
              key="burst"
              className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-current/25"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              aria-hidden
            />
            <motion.span
              key="burst-2"
              className="absolute -top-0.5 -left-0.5 h-7 w-7 rounded-full bg-current/15"
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              aria-hidden
            />
          </>
        )}
      </AnimatePresence>
    </span>
  );
}
