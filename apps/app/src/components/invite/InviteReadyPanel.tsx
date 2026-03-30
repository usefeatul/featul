import { Button } from "@featul/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { motion } from "framer-motion";
import { ArrowRight, Mail, UserRoundPlus } from "lucide-react";
import {
  getInviteMotionProps,
  getInviteTransition,
} from "@/components/invite/invite-shared";

type Props = {
  workspaceName: string | null;
  workspaceLogo: string | null;
  inviterName: string | null;
  prettyRole: string | null;
  roleBadgeClass?: string;
  initials: string;
  email: string;
  isBusy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  prefersReducedMotion: boolean;
};

export default function InviteReadyPanel({
  workspaceName,
  workspaceLogo,
  inviterName,
  prettyRole,
  roleBadgeClass,
  initials,
  email,
  isBusy,
  onAccept,
  onDecline,
  prefersReducedMotion,
}: Props) {
  const transition = getInviteTransition(prefersReducedMotion);
  const motionProps = getInviteMotionProps(prefersReducedMotion);

  return (
    <motion.div
      key="ready"
      {...motionProps}
      transition={transition}
      className="space-y-6"
    >
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-accent">
          Workspace invite
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.2rem]">
          Join {workspaceName || "your workspace"}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-accent">
          {inviterName || "Someone"} invited you to collaborate in{" "}
          {workspaceName || "this workspace"}
          {prettyRole ? ` as ${prettyRole.toLowerCase()}.` : "."}
        </p>
      </div>

      <motion.div layout className="p-0">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 rounded-md">
            {workspaceLogo ? (
              <AvatarImage
                src={workspaceLogo}
                alt={workspaceName || "workspace"}
              />
            ) : null}
            <AvatarFallback className="rounded-md bg-muted text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {workspaceName || "Workspace"}
            </p>
            <p className="mt-1 truncate text-sm text-accent">
              Invited by {inviterName || "your admin"}
            </p>
          </div>
          {prettyRole ? (
            <span className={roleBadgeClass}>{prettyRole}</span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-md bg-muted/35 px-3 py-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted text-accent">
            <Mail className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              Signed in as
            </p>
            <p className="truncate text-sm text-foreground">
              {email || "Checking your account"}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div layout className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full rounded-md"
          disabled={isBusy}
          onClick={onAccept}
        >
          <UserRoundPlus className="size-4" />
          Accept invite
          <ArrowRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full rounded-md"
          disabled={isBusy}
          onClick={onDecline}
        >
          Decline
        </Button>
      </motion.div>

      <p className="text-xs leading-5 text-accent">
        This invite is tied to {email || "your signed-in email"} and will open
        the workspace immediately after you accept.
      </p>
    </motion.div>
  );
}
