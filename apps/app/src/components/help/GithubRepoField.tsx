"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { Input, InputGroup } from "@featul/ui/components/input";
import { cn } from "@featul/ui/lib/utils";
import { GitHubIcon, LoaderIcon, LockIcon } from "@/components/global/icons";
import { expectOk } from "@/hooks/useHelpTree";

type GithubStatus = {
  configured: boolean;
  connected: boolean;
  accountLogin: string | null;
};
type GithubRepo = {
  fullName: string;
  private: boolean;
  description: string | null;
};

const STATUS_MESSAGES: Record<string, string> = {
  connected: "GitHub connected.",
  authorization_required:
    "GitHub didn't send an authorization code. Ask an admin to turn on user authorization for the Featul GitHub App.",
  wrong_user:
    "Finish connecting GitHub while signed in as the same Featul user.",
  invalid_state: "The GitHub connection link expired. Please try again.",
  failed: "Couldn't verify your access to that GitHub installation.",
  missing_installation:
    "GitHub didn't return an installation. Please try again.",
};

/** Marks a return trip that happened in the tab "Connect GitHub" opened. */
const TAB_PARAM = "github_tab";
const CHANNEL = "featul:github-setup";

function showSetupStatus(status: string) {
  const message = STATUS_MESSAGES[status] ?? "Couldn't connect GitHub.";
  if (status === "connected") toast.success(message);
  else toast.error(message);
}

/**
 * Shows the `?github=` result of the install round trip once, then removes it from the URL.
 * When that trip ran in its own tab, hands the result to the tab that opened it and closes.
 */
export function useGithubSetupToast() {
  const queryClient = useQueryClient();
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("github");
    const inSetupTab = url.searchParams.has(TAB_PARAM);
    if (status) {
      url.searchParams.delete("github");
      url.searchParams.delete(TAB_PARAM);
      window.history.replaceState(null, "", url.toString());
      if (inSetupTab && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel(CHANNEL);
        channel.postMessage(status);
        channel.close();
        window.close();
      }
      // Still shown when the tab can't close, so it works as a normal page.
      showSetupStatus(status);
    }

    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (event: MessageEvent<string>) => {
      showSetupStatus(String(event.data));
      void queryClient.invalidateQueries({ queryKey: ["help-github-status"] });
      void queryClient.invalidateQueries({ queryKey: ["help-github-repos"] });
    };
    return () => channel.close();
  }, [queryClient]);
}

/**
 * GitHub repository input. Anyone can type a public repo; once the workspace has installed the
 * Featul GitHub App, the dropdown also lists the private repos it was granted.
 */
export function GithubRepoField({
  workspaceSlug,
  value,
  onChange,
  className,
  fieldClassName = "h-10",
}: {
  workspaceSlug: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Classes for the field itself, such as its height. */
  fieldClassName?: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [connecting, setConnecting] = React.useState(false);
  const listboxId = React.useId();
  const statusKey = ["help-github-status", workspaceSlug];

  const { data: status } = useQuery<GithubStatus>({
    queryKey: statusKey,
    queryFn: async () => {
      const res = await client.help.githubStatus.$get({ slug: workspaceSlug });
      await expectOk(res, "Couldn't load GitHub status");
      return (await res.json()) as GithubStatus;
    },
    staleTime: 60_000,
  });
  const { data: repoData, isFetching } = useQuery<{ repos: GithubRepo[] }>({
    queryKey: ["help-github-repos", workspaceSlug],
    enabled: Boolean(status?.connected),
    queryFn: async () => {
      const res = await client.help.githubRepos.$get({ slug: workspaceSlug });
      await expectOk(res, "Couldn't load your GitHub repositories");
      return (await res.json()) as { repos: GithubRepo[] };
    },
    staleTime: 60_000,
  });
  const repos = repoData?.repos ?? [];
  const query = value
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//, "");
  const matches = repos
    .filter((r) => r.fullName.toLowerCase().includes(query))
    .slice(0, 8);
  const selected = repos.find((r) => r.fullName.toLowerCase() === query);
  const listOpen = open && Boolean(status?.connected) && matches.length > 0;
  const activeIndex = listOpen && active < matches.length ? active : -1;
  const optionId = (index: number) => `${listboxId}-${index}`;

  React.useEffect(() => {
    if (activeIndex < 0) return;
    document
      .getElementById(`${listboxId}-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId]);

  const choose = (repo: GithubRepo) => {
    onChange(repo.fullName);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!status?.connected) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!matches.length) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive(
        activeIndex < 0
          ? step === 1
            ? 0
            : matches.length - 1
          : (activeIndex + step + matches.length) % matches.length,
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      // Picks the option instead of submitting the surrounding form.
      e.preventDefault();
      choose(matches[activeIndex]!);
    } else if (e.key === "Escape" && listOpen) {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  const connect = async () => {
    setConnecting(true);
    // Opened during the click so popup blockers allow it; it goes to GitHub once the URL is ready.
    // Without it (blocked), GitHub opens in this tab instead.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    try {
      // Coming back must not auto-start another scan or replay an old connect result.
      const back = new URL(window.location.href);
      back.searchParams.delete("start");
      back.searchParams.delete("github");
      if (tab) back.searchParams.set(TAB_PARAM, "1");
      const res = await client.help.githubConnectUrl.$post({
        slug: workspaceSlug,
        returnTo: `${back.pathname}${back.search}`,
      });
      await expectOk(res, "Couldn't start the GitHub connection");
      const { url } = (await res.json()) as { url: string };
      if (tab) {
        tab.location.href = url;
        setConnecting(false);
      } else {
        window.location.href = url;
      }
    } catch (error) {
      tab?.close();
      toast.error(
        error instanceof Error ? error.message : "Couldn't connect GitHub",
      );
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    const res = await client.help.githubDisconnect.$post({
      slug: workspaceSlug,
    });
    if (!res.ok) return toast.error("Couldn't disconnect GitHub");
    await queryClient.invalidateQueries({ queryKey: statusKey });
    toast.success(
      "GitHub disconnected. You can also uninstall the app from your GitHub settings.",
    );
  };

  return (
    <div className={cn("relative", className)}>
      <InputGroup className={fieldClassName}>
        <GitHubIcon className="size-4 shrink-0" />
        <Input
          variant="plain"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={
            status?.connected
              ? "Search your repositories"
              : "github.com/your-org/your-repo"
          }
          aria-label="GitHub repository"
          role={status?.connected ? "combobox" : undefined}
          aria-expanded={status?.connected ? listOpen : undefined}
          aria-controls={status?.connected ? listboxId : undefined}
          aria-autocomplete={status?.connected ? "list" : undefined}
          aria-activedescendant={
            activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
        />
        {selected?.private ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground dark:bg-white/[0.06]">
            <LockIcon className="size-2.5" />
            Private
          </span>
        ) : null}
        {isFetching ? (
          <LoaderIcon className="size-3.5 shrink-0 text-muted-foreground" />
        ) : null}
      </InputGroup>

      {listOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="GitHub repositories"
          className="mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-border/80 bg-popover p-1 shadow-sm animate-in fade-in-0 dark:border-white/10"
        >
          {matches.map((repo, index) => (
            <li key={repo.fullName}>
              <button
                type="button"
                id={optionId(index)}
                role="option"
                tabIndex={-1}
                aria-selected={repo === selected}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(repo)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-muted dark:hover:bg-white/[0.06]",
                  index === activeIndex && "bg-muted dark:bg-white/[0.06]",
                )}
              >
                <GitHubIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {repo.fullName}
                  </span>
                  {repo.description ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {repo.description}
                    </span>
                  ) : null}
                </span>
                {repo.private ? (
                  <LockIcon className="size-3 shrink-0 text-muted-foreground" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-1.5 text-xs text-muted-foreground">
        {!status ? (
          " "
        ) : status.connected ? (
          <>
            Connected to{" "}
            <span className="font-medium text-foreground">
              {status.accountLogin}
            </span>{" "}
            on GitHub ·{" "}
            <button
              type="button"
              onClick={() => void connect()}
              className="cursor-pointer font-medium text-primary hover:underline"
            >
              Add repositories
            </button>{" "}
            ·{" "}
            <button
              type="button"
              onClick={() => void disconnect()}
              className="cursor-pointer hover:text-foreground hover:underline"
            >
              Disconnect
            </button>
          </>
        ) : status.configured ? (
          <>
            Public repos work as is.{" "}
            <button
              type="button"
              onClick={() => void connect()}
              disabled={connecting}
              className="cursor-pointer font-medium text-primary hover:underline disabled:opacity-60"
            >
              {connecting ? "Opening GitHub…" : "Connect GitHub"}
            </button>{" "}
            to scan private repos (read-only).
          </>
        ) : (
          "Public repos only."
        )}
      </p>
    </div>
  );
}
