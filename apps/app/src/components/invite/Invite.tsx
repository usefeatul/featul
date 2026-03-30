"use client";

import React from "react";
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
import InviteActionState from "@/components/invite/InviteActionState";
import InviteErrorPanel from "@/components/invite/InviteErrorPanel";
import InviteReadyPanel from "@/components/invite/InviteReadyPanel";
import InviteSkeleton from "@/components/invite/InviteSkeleton";
import { getInviteRoleBadgeClass } from "@/components/invite/invite-shared";

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
  const [token, setToken] = React.useState("");
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
  const [redirectTarget, setRedirectTarget] = React.useState<string | null>(
    null,
  );

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
    const nextToken = (tokenProp || tokenParam || "").trim();
    if (!nextToken) {
      showErrorState(
        "Invite unavailable",
        "This invite link is missing or incomplete.",
        "start",
      );
      return;
    }

    let mounted = true;
    setToken(nextToken);
    setScreen("loading");

    const sessionPromise = authClient.getSession();
    const invitePromise = client.team.inviteByToken.$get({ token: nextToken });

    (async () => {
      const [sessionResult, inviteResult] = await Promise.allSettled([
        sessionPromise,
        invitePromise,
      ]);

      const session =
        sessionResult.status === "fulfilled" ? sessionResult.value : null;

      if (!session?.data?.user) {
        router.replace(`/auth/sign-in?redirect=/invite/${nextToken}`);
        return;
      }

      if (mounted) {
        setUser(session.data.user);
      }

      if (inviteResult.status !== "fulfilled") {
        if (mounted) {
          showErrorState(
            "Could not load invite",
            "We hit a problem loading this invite. Try again in a moment.",
            "reload",
          );
        }
        return;
      }

      const response = inviteResult.value;
      if (!response.ok) {
        if (!mounted) return;

        if (response.status === 403) {
          showErrorState(
            "Use the invited email",
            "This invite belongs to a different email address. Sign in with the invited account to continue.",
            "start",
          );
          return;
        }

        if (response.status === 410) {
          showErrorState(
            "Invite expired",
            "This invite has expired. Ask your workspace admin to send a new one.",
            "start",
          );
          return;
        }

        if (response.status === 404) {
          showErrorState(
            "Invite not found",
            "This invite link is invalid or has already been used.",
            "start",
          );
          return;
        }

        showErrorState(
          "Could not load invite",
          "We hit a problem loading this invite. Try again in a moment.",
          "reload",
        );
        return;
      }

      const { invite } = (await response.json()) as InviteByTokenResponse;
      if (!invite) {
        if (mounted) {
          showErrorState(
            "Invite not found",
            "This invite is no longer available.",
            "start",
          );
        }
        return;
      }

      if (!mounted) return;

      setWorkspaceName(invite.workspaceName || null);
      setWorkspaceSlug(invite.workspaceSlug || null);
      setWorkspaceLogo(invite.workspaceLogo || null);
      setInviterName(invite.invitedByName || null);
      setRole(invite.role || null);
      setScreen("ready");
    })();

    return () => {
      mounted = false;
    };
  }, [fetchVersion, router, showErrorState, tokenParam, tokenProp]);

  React.useEffect(() => {
    if (!redirectTarget) return;
    if (screen !== "accepted" && screen !== "declined") return;

    const delay =
      prefersReducedMotion ? 120 : screen === "accepted" ? 950 : 800;

    const timeoutId = window.setTimeout(() => {
      router.replace(redirectTarget);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [prefersReducedMotion, redirectTarget, router, screen]);

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
      const response = await client.team.acceptInvite.$post({ token });
      if (!response.ok) {
        const message = await readApiErrorMessage(response, "Invite failed");
        throw new Error(message);
      }

      const data = (await response.json().catch(() => null)) as
        | AcceptInviteResponse
        | null;

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
    } catch (error) {
      showErrorState(
        "Could not accept invite",
        (error as { message?: string })?.message ||
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
      const response = await client.team.declineInvite.$post({ token });
      if (!response.ok) {
        const message = await readApiErrorMessage(response, "Decline failed");
        throw new Error(message);
      }

      captureAnalyticsEvent(analyticsEvents.inviteDeclined, {
        workspace_name: workspaceName || null,
      });

      setRedirectTarget("/start");
      setScreen("declined");
    } catch (error) {
      showErrorState(
        "Could not decline invite",
        (error as { message?: string })?.message ||
          "Something went wrong while declining this invite.",
        "ready",
      );
    }
  };

  const name = (user?.name || user?.email?.split("@")[0] || "").trim();
  const email = (user?.email || "").trim();
  const initials = getInitials(workspaceName || name || "U");
  const prettyRole = role
    ? `${role.charAt(0).toUpperCase()}${role.slice(1)}`
    : null;
  const roleBadgeClass = getInviteRoleBadgeClass(role);
  const errorButtonLabel =
    errorState.action === "reload"
      ? "Try again"
      : errorState.action === "ready"
        ? "Back to invite"
        : "Go to start";

  const renderContent = () => {
    if (screen === "loading") {
      return <InviteSkeleton />;
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
          prefersReducedMotion={prefersReducedMotion}
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
        prefersReducedMotion={prefersReducedMotion}
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
