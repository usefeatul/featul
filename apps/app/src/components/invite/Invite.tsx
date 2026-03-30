"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar";
import { cn } from "@featul/ui/lib/utils";
import { getInitials } from "@/utils/user";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@featul/auth/client";
import { client } from "@featul/api/client";
import { readApiErrorMessage } from "@/hooks/postApiError";
import type {
  AcceptInviteResponse,
  InviteByTokenResponse,
  InviteRole,
  InviteUser,
} from "@/types/invite";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  LoaderCircle,
  Mail,
  UserRoundPlus,
  X,
} from "lucide-react";

type InviteScreen =
  | "loading"
  | "ready"
  | "accepting"
  | "accepted"
  | "declining"
  | "declined"
  | "error";

type ErrorAction = "start" | "reload" | "ready";

type InviteProps = {
  token?: string;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  workspaceLogo?: string | null;
  inviterName?: string | null;
  role?: InviteRole | null;
  user?: { name?: string; email?: string; image?: string | null } | null;
  busy?: boolean;
  loading?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
};

type InviteErrorState = {
  title: string;
  message: string;
  action: ErrorAction;
};

type InviteTransitionProps = {
  initial: { opacity: number } | { opacity: number; y: number; scale: number };
  animate: { opacity: number } | { opacity: number; y: number; scale: number };
  exit: { opacity: number } | { opacity: number; y: number; scale: number };
};

function InviteLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-10 w-4/5 rounded-md bg-muted" />
        <div className="h-4 w-full rounded-full bg-muted" />
        <div className="h-4 w-3/4 rounded-full bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-md bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-32 rounded-full bg-muted" />
            <div className="h-3 w-24 rounded-full bg-muted" />
          </div>
          <div className="h-7 w-[4.5rem] rounded-md bg-muted" />
        </div>

        <div className="flex items-center gap-3 py-1">
          <div className="size-9 rounded-md bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-20 rounded-full bg-muted" />
            <div className="h-4 w-40 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-11 rounded-md bg-muted" />
        <div className="h-11 rounded-md bg-muted/70" />
      </div>
    </div>
  );
}

function InviteActionState({
  screen,
  workspaceName,
  prefersReducedMotion,
  transition,
  motionProps,
}: {
  screen: "accepting" | "declining" | "accepted" | "declined";
  workspaceName: string | null;
  prefersReducedMotion: boolean;
  transition: { duration: number; ease?: readonly [number, number, number, number] };
  motionProps: InviteTransitionProps;
}) {
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
        initial={prefersReducedMotion ? false : { scale: isPending ? 0.96 : 0.88, opacity: isPending ? 0.7 : 0 }}
        animate={prefersReducedMotion ? undefined : isPending ? { scale: [0.96, 1, 0.96], opacity: 1 } : { scale: 1, opacity: 1 }}
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
          isAccepted && "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
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

      <h2 className={cn("font-semibold tracking-[-0.03em] text-foreground", isPending ? "mt-6 text-2xl" : "mt-6 text-3xl")}>
        {screen === "accepting" && "Accepting invite"}
        {screen === "declining" && "Declining invite"}
        {screen === "accepted" && "You’re in"}
        {screen === "declined" && "Invite declined"}
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-accent">
        {screen === "accepting" && `Getting ${workspaceName || "your workspace"} ready for you.`}
        {screen === "declining" && "Closing this invite and updating your access."}
        {screen === "accepted" && `Opening ${workspaceName || "your workspace"} now.`}
        {screen === "declined" && "You won’t be added to this workspace. Taking you back now."}
      </p>
    </motion.div>
  );
}

function InviteErrorPanel({
  title,
  message,
  email,
  buttonLabel,
  onAction,
  transition,
  motionProps,
}: {
  title: string;
  message: string | null;
  email: string;
  buttonLabel: string;
  onAction: () => void;
  transition: { duration: number; ease?: readonly [number, number, number, number] };
  motionProps: InviteTransitionProps;
}) {
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
        <p className="mt-3 text-sm leading-6 text-accent">
          {message}
        </p>
        {email ? (
          <p className="mt-2 text-sm text-foreground">
            Signed in as {email}
          </p>
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

function InviteReadyPanel({
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
  transition,
  motionProps,
}: {
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
  transition: { duration: number; ease?: readonly [number, number, number, number] };
  motionProps: InviteTransitionProps;
}) {
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

export default function Invite({
  token: tokenProp,
  workspaceName: wsNameProp,
  workspaceSlug: wsSlugProp,
  workspaceLogo: wsLogoProp,
  inviterName: inviterProp,
  role: roleProp,
  user: userProp,
  busy: busyProp,
  loading: loadingProp = false,
  onAccept,
  onDecline,
}: InviteProps) {
  const router = useRouter();
  const routeParams = useParams<{ token?: string | string[] }>();
  const tokenRaw = routeParams?.token;
  const tokenParam = typeof tokenRaw === "string" ? tokenRaw : undefined;
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [screen, setScreen] = React.useState<InviteScreen>(
    loadingProp || !wsNameProp ? "loading" : "ready",
  );
  const [token, setToken] = React.useState<string>("");
  const [workspaceName, setWorkspaceName] = React.useState<string | null>(
    wsNameProp ?? null,
  );
  const [workspaceSlug, setWorkspaceSlug] = React.useState<string | null>(
    wsSlugProp ?? null,
  );
  const [workspaceLogo, setWorkspaceLogo] = React.useState<string | null>(
    wsLogoProp ?? null,
  );
  const [inviterName, setInviterName] = React.useState<string | null>(
    inviterProp ?? null,
  );
  const [role, setRole] = React.useState<InviteRole | null>(roleProp ?? null);
  const [user, setUser] = React.useState<InviteUser | null>(userProp ?? null);
  const [errorState, setErrorState] = React.useState<InviteErrorState>({
    title: "Invite unavailable",
    message: "",
    action: "start",
  });
  const [fetchVersion, setFetchVersion] = React.useState(0);
  const [redirectTarget, setRedirectTarget] = React.useState<string | null>(null);

  const isBusy =
    !!busyProp || screen === "accepting" || screen === "declining";

  const showErrorState = React.useCallback(
    (title: string, message: string, action: ErrorAction = "start") => {
      setErrorState({ title, message, action });
      setScreen("error");
    },
    [],
  );

  React.useEffect(() => {
    const t = (tokenProp || tokenParam || "").trim();
    if (!t) {
      showErrorState(
        "Invite unavailable",
        "This invite link is missing or incomplete.",
        "start",
      );
      return;
    }

    setToken(t);
    let mounted = true;
    setScreen("loading");

    const sessionPromise = authClient.getSession();
    const invitePromise = client.team.inviteByToken.$get({ token: t });

    (async () => {
      const [sRes, iRes] = await Promise.allSettled([
        sessionPromise,
        invitePromise,
      ]);
      const s = sRes.status === "fulfilled" ? sRes.value : null;
      if (!s?.data?.user) {
        router.replace(`/auth/sign-in?redirect=/invite/${t}`);
        return;
      }
      if (mounted && s?.data?.user) setUser(s.data.user);

      if (iRes.status === "fulfilled") {
        const res = iRes.value;
        if (!res.ok) {
          if (!mounted) return;

          if (res.status === 403) {
            showErrorState(
              "Use the invited email",
              "This invite belongs to a different email address. Sign in with the invited account to continue.",
              "start",
            );
          } else if (res.status === 410) {
            showErrorState(
              "Invite expired",
              "This invite has expired. Ask your workspace admin to send a new one.",
              "start",
            );
          } else if (res.status === 404) {
            showErrorState(
              "Invite not found",
              "This invite link is invalid or has already been used.",
              "start",
            );
          } else {
            showErrorState(
              "Could not load invite",
              "We hit a problem loading this invite. Try again in a moment.",
              "reload",
            );
          }
        } else {
          const { invite } = (await res.json()) as InviteByTokenResponse;
          if (invite && mounted) {
            setWorkspaceName(invite.workspaceName || null);
            setWorkspaceSlug(invite.workspaceSlug || null);
            setWorkspaceLogo(invite.workspaceLogo || null);
            setInviterName(invite.invitedByName || null);
            setRole(invite.role || null);
            setScreen("ready");
          } else if (mounted) {
            showErrorState(
              "Invite not found",
              "This invite is no longer available.",
              "start",
            );
          }
        }
      } else {
        if (mounted) {
          showErrorState(
            "Could not load invite",
            "We hit a problem loading this invite. Try again in a moment.",
            "reload",
          );
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchVersion, router, showErrorState, tokenParam, tokenProp]);

  React.useEffect(() => {
    if (!redirectTarget) return;
    if (screen !== "accepted" && screen !== "declined") return;

    const delay = prefersReducedMotion ? 120 : screen === "accepted" ? 950 : 800;
    const timeoutId = window.setTimeout(() => {
      router.replace(redirectTarget);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [prefersReducedMotion, redirectTarget, router, screen]);

  const name = (user?.name || user?.email?.split("@")[0] || "").trim();
  const email = (user?.email || "").trim();
  const initials = getInitials(workspaceName || name || "U");
  const prettyRole = role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : null;

  const screenTransition = React.useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0.12 }
        : { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const },
    [prefersReducedMotion],
  );

  const screenMotionProps = React.useMemo(
    () =>
      prefersReducedMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : {
            initial: { opacity: 0, y: 14, scale: 0.985 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -10, scale: 0.985 },
          },
    [prefersReducedMotion],
  );

  const handleErrorAction = React.useCallback(() => {
    if (errorState.action === "reload") {
      setRedirectTarget(null);
      setFetchVersion((version) => version + 1);
      return;
    }
    if (errorState.action === "ready") {
      setScreen("ready");
      return;
    }
    router.replace("/start");
  }, [errorState.action, router]);

  const handleAccept = async () => {
    if (onAccept) return onAccept();
    if (!token || isBusy) return;
    setScreen("accepting");
    try {
      const res = await client.team.acceptInvite.$post({ token });
      if (!res.ok) {
        const message = await readApiErrorMessage(res, "Invite failed");
        throw new Error(message);
      }
      const data = (await res.json().catch(() => null)) as AcceptInviteResponse | null;
      if (!data?.ok) {
        throw new Error("Invite failed");
      }
      const targetSlug =
        data.workspaceSlug?.trim() || workspaceSlug?.trim() || null;
      if (targetSlug) {
        try {
          await authClient.organization.setActive({
            organizationSlug: targetSlug,
          });
        } catch {
          // Non-blocking: redirect still succeeds even if org activation request fails.
        }
      }
      captureAnalyticsEvent(analyticsEvents.inviteAccepted, {
        workspace_name: workspaceName || null,
        workspace_slug: targetSlug,
      });
      setRedirectTarget(targetSlug ? `/workspaces/${targetSlug}` : "/start");
      setScreen("accepted");
    } catch (e: unknown) {
      showErrorState(
        "Could not accept invite",
        (e as { message?: string })?.message ||
          "Something went wrong while accepting this invite.",
        "ready",
      );
    }
  };

  const handleDecline = async () => {
    if (onDecline) return onDecline();
    if (!token || isBusy) return;
    setScreen("declining");
    try {
      const res = await client.team.declineInvite.$post({ token });
      if (!res.ok) {
        const message = await readApiErrorMessage(res, "Decline failed");
        throw new Error(message);
      }
      captureAnalyticsEvent(analyticsEvents.inviteDeclined, {
        workspace_name: workspaceName || null,
      });
      setRedirectTarget("/start");
      setScreen("declined");
    } catch (e: unknown) {
      showErrorState(
        "Could not decline invite",
        (e as { message?: string })?.message ||
          "Something went wrong while declining this invite.",
        "ready",
      );
    }
  };

  const errorButtonLabel =
    errorState.action === "reload"
      ? "Try again"
      : errorState.action === "ready"
        ? "Back to invite"
        : "Go to start";

  const roleBadgeClass = role
    ? cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]",
        role === "admin" && "border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
        role === "member" && "border-border/70 bg-muted/40 text-foreground",
        role === "viewer" && "border-sky-500/25 bg-sky-500/8 text-sky-700 dark:text-sky-300",
      )
    : undefined;

  const renderContent = () => {
    if (screen === "loading") {
      return <InviteLoadingSkeleton />;
    }

    if (
      screen === "accepting" ||
      screen === "declining" ||
      screen === "accepted" ||
      screen === "declined"
    ) {
      return (
        <InviteActionState
          screen={screen}
          workspaceName={workspaceName}
          prefersReducedMotion={prefersReducedMotion}
          transition={screenTransition}
          motionProps={screenMotionProps}
        />
      );
    }

    if (screen === "error") {
      return (
        <InviteErrorPanel
          title={errorState.title}
          message={errorState.message}
          email={email}
          buttonLabel={errorButtonLabel}
          onAction={handleErrorAction}
          transition={screenTransition}
          motionProps={screenMotionProps}
        />
      );
    }

    return (
      <InviteReadyPanel
        workspaceName={workspaceName}
        workspaceLogo={workspaceLogo}
        inviterName={inviterName}
        prettyRole={prettyRole}
        roleBadgeClass={roleBadgeClass}
        initials={initials}
        email={email}
        isBusy={isBusy}
        onAccept={handleAccept}
        onDecline={handleDecline}
        transition={screenTransition}
        motionProps={screenMotionProps}
      />
    );
  };

  if (screen === "loading") {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
        <div className="relative z-10 w-full max-w-md p-6">
          {renderContent()}
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <motion.div layout className="relative z-10 w-full max-w-md">
        <motion.div layout className="p-6">
          <AnimatePresence mode="wait" initial={false}>
            {renderContent()}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
