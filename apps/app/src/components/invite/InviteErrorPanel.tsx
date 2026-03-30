import { Button } from "@featul/ui/components/button";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import {
  getInviteMotionProps,
  getInviteTransition,
} from "@/components/invite/invite-shared";

type Props = {
  title: string;
  message: string;
  email: string;
  buttonLabel: string;
  onAction: () => void;
  prefersReducedMotion: boolean;
};

export default function InviteErrorPanel({
  title,
  message,
  email,
  buttonLabel,
  onAction,
  prefersReducedMotion,
}: Props) {
  const transition = getInviteTransition(prefersReducedMotion);
  const motionProps = getInviteMotionProps(prefersReducedMotion);

  return (
    <motion.div
      key="error"
      {...motionProps}
      transition={transition}
      className="space-y-6"
    >
      <div className="flex size-12 items-center justify-center rounded-md border border-destructive/20 bg-destructive/6 text-destructive">
        <AlertCircle className="size-5" />
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-accent">{message}</p>
        {email ? (
          <p className="mt-2 text-sm text-foreground">Signed in as {email}</p>
        ) : null}
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full rounded-md"
        onClick={onAction}
      >
        {buttonLabel}
      </Button>
    </motion.div>
  );
}
