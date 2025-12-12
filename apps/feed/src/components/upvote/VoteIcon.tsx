import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@oreilla/ui/lib/utils";

interface VoteIconProps {
  hasVoted: boolean;
}

export function VoteIcon({ hasVoted }: VoteIconProps) {
  return (
    <span className="relative inline-flex items-center">
      <motion.span
        key={hasVoted ? "liked" : "unliked"}
        animate={{
          scale: hasVoted ? [1, 1.2, 1] : [1, 0.95, 1],
          rotate: hasVoted ? [0, -6, 0] : 0,
        }}
        transition={{ duration: 0.25 }}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5",
            !hasVoted && "group-hover/vote:scale-110 transition-transform"
          )}
          fill={hasVoted ? "currentColor" : "none"}
        />
      </motion.span>
      <AnimatePresence>
        {hasVoted && (
          <>
            <motion.span
              key="burst"
              className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-red-500/25"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              aria-hidden
            />
            <motion.span
              key="burst-2"
              className="absolute -top-0.5 -left-0.5 h-7 w-7 rounded-full bg-red-500/15"
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
