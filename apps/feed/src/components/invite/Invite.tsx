"use client";

import React from "react";
import { Button } from "@feedgot/ui/components/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feedgot/ui/components/avatar";
import { getInitials } from "@/utils/user-utils";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@feedgot/auth/client";
import { client } from "@feedgot/api/client";
import { toast } from "sonner";

type InviteProps = {
  workspaceName?: string | null;
  workspaceLogo?: string | null;
  inviterName?: string | null;
  user?: { name?: string; email?: string; image?: string | null } | null;
  busy?: boolean;
  loading?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
};
export default function Invite({
  workspaceName: wsNameProp,
  workspaceLogo: wsLogoProp,
  inviterName: inviterProp,
  user: userProp,
  busy: busyProp,
  loading: loadingProp = false,
  onAccept,
  onDecline,
}: InviteProps) {
  const router = useRouter();
  const routeParams = useParams() as any;
  const tokenParam = typeof routeParams?.token === "string" ? routeParams.token : undefined;

  const [busy, setBusy] = React.useState<boolean>(!!busyProp);
  const [loading, setLoading] = React.useState<boolean>(!!loadingProp);
  const [token, setToken] = React.useState<string>("");
  const [workspaceName, setWorkspaceName] = React.useState<string | null>(wsNameProp ?? null);
  const [workspaceLogo, setWorkspaceLogo] = React.useState<string | null>(wsLogoProp ?? null);
  const [inviterName, setInviterName] = React.useState<string | null>(inviterProp ?? null);
  const [user, setUser] = React.useState<any>(userProp ?? null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = (tokenParam || "").trim();
    if (!t) return;
    setToken(t);
    let mounted = true;
    setLoading(true);
    const sessionPromise = authClient.getSession();
    const invitePromise = client.team.inviteByToken.$get({ token: t });
    (async () => {
      const [sRes, iRes] = await Promise.allSettled([sessionPromise, invitePromise]);
      const s = sRes.status === "fulfilled" ? sRes.value : null;
      if (!s?.data?.user) {
        router.replace(`/auth/sign-in?redirect=/invite/${t}`);
        return;
      }
      if (mounted && s?.data?.user) setUser(s.data.user);
      if (iRes.status === "fulfilled") {
        const res = iRes.value as Response;
        if (!res.ok) {
          if ((res as any)?.status === 403) setError("This invite is for a different email. Please sign in with the invited address.");
          else if ((res as any)?.status === 410) setError("This invite has expired. Ask your admin to send a new one.");
          else if ((res as any)?.status === 404) setError("Invalid invite link.");
          else setError("Could not load invite.");
        } else {
          const { invite } = (await res.json()) as { invite?: { workspaceName?: string | null; workspaceLogo?: string | null; invitedByName?: string | null } };
          if (invite) {
            setWorkspaceName(invite.workspaceName || null);
            setWorkspaceLogo(invite.workspaceLogo || null);
            setInviterName(invite.invitedByName || null);
          } else {
            setError("Invite not found or expired.");
          }
        }
      } else {
        setError("Could not load invite.");
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [tokenParam, router]);

  const name = (user?.name || user?.email?.split("@")[0] || "").trim();
  const email = (user?.email || "").trim();
  const initials = getInitials(name || workspaceName || "U");

  const handleAccept = async () => {
    if (onAccept) return onAccept();
    if (!token || busy) return;
    setBusy(true);
    try {
      const res = await client.team.acceptInvite.$post({ token });
      if (!res.ok) throw new Error("Invite failed");
      let targetSlug: string | null = null;
      try {
        const mineRes = await client.workspace.listMine.$get();
        const mineData = await mineRes.json();
        const all = (mineData?.workspaces || []) as { slug: string; name: string }[];
        if (workspaceName) {
          const found = all.find((w) => w.name === workspaceName);
          targetSlug = found?.slug || null;
        }
        if (!targetSlug && all.length > 0) {
          targetSlug = all[0]?.slug || null;
        }
      } catch {}
      toast.success("Invite accepted");
      if (targetSlug) router.replace(`/workspaces/${targetSlug}`);
      else router.replace("/start");
    } catch (e) {
      toast.error("Invite failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async () => {
    if (onDecline) return onDecline();
    if (!token || busy) return;
    setBusy(true);
    try {
      const res = await client.team.declineInvite.$post({ token });
      if (!res.ok) throw new Error("Decline failed");
      toast.success("Invite declined");
      router.replace("/start");
    } catch (e) {
      toast.error("Invite failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-5">
      <div className="w-full max-w-sm sm:max-w-md">
        {error ? (
          <div className="rounded-md border bg-card p-3 text-sm text-accent">
            {error}
            {user?.email ? <span className="ml-1">Signed in as {user.email}.</span> : null}
          </div>
        ) : null}
        <div className="mx-auto w-full max-w-[380px]">
          <div className="text-left">
            <h1 className="text-4xl font-semibold">You've been invited</h1>
            {loading ? (
              <div className="mt-1 h-5 w-64 bg-muted rounded animate-pulse" />
            ) : (
              <p className="mt-1 text-lg text-accent">
                {inviterName || "Someone"} has invited you to join{" "}
                {workspaceName || "this workspace"}
              </p>
            )}
            <div className="mt-4 flex items-center justify-start gap-3">
              <div className="rounded-md border ring-1 ring-border overflow-hidden">
                <Avatar className="size-8">
                  {workspaceLogo ? (
                    <AvatarImage
                      src={workspaceLogo}
                      alt={workspaceName || "workspace"}
                    />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-left">
                {loading ? (
                  <>
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="mt-1 h-3 w-24 bg-muted rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    {workspaceName ? (
                      <div className="text-sm font-medium truncate">{workspaceName}</div>
                    ) : null}
                    {name ? (
                      <div className="text-xs text-accent truncate">{name}</div>
                    ) : null}
                    {email ? (
                      <div className="text-xs text-accent truncate">
                        {email}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-start gap-2">
            <Button
              type="button"
              variant="quiet"
              size="lg"
              className="w-full bg-primary/90 hover:bg-primary text-white"
              disabled={busy}
              onClick={handleAccept}
            >
              Accept invitation
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="lg"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={busy}
              onClick={handleDecline}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
