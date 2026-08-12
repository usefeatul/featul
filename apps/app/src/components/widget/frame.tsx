"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Home,
  Map,
  Megaphone,
  MessageSquare,
  Pencil,
  X,
} from "lucide-react";
import { client } from "@featul/api/client";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import { WidgetFeedbackCompose } from "./FeedbackCompose";
import { WidgetFeedbackDetail } from "./FeedbackDetail";
import { WidgetFeedbackList } from "./FeedbackList";
import { WidgetRoadmap, type WidgetRoadmapItem } from "./Roadmap";
import type {
  Board,
  FeedbackView,
  IdentifiedUser,
  Section,
  WidgetPost,
  WidgetWorkspace,
} from "./types";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { resolveWidgetAccent } from "./theme";
import { WidgetAuthorAvatar } from "./AuthorAvatar";
import { WidgetVoteButton } from "./VoteButton";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";

type WidgetFrameProps = {
  projectId: string;
  parentOrigin: string;
  initialTheme: "light" | "dark" | "auto";
  initialSection: Section;
  initialPosition: "left" | "right";
};

export default function WidgetFrame({
  projectId,
  parentOrigin,
  initialSection,
  initialPosition,
}: WidgetFrameProps) {
  const [section, setSection] = React.useState<Section>(initialSection || "home");
  const [feedbackView, setFeedbackView] = React.useState<FeedbackView>("list");
  const [workspace, setWorkspace] = React.useState<WidgetWorkspace | null>(null);
  const [tabs, setTabs] = React.useState<Section[]>(["home", "feedback", "roadmap", "changelog"]);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [listBoardId, setListBoardId] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [identity, setIdentity] = React.useState<IdentifiedUser | null>(null);
  const [roadmap, setRoadmap] = React.useState<WidgetRoadmapItem[]>([]);
  const [changelog, setChangelog] = React.useState<
    Array<{ id: string; title: string; summary: string | null; publishedAt: string | null }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [selectedPost, setSelectedPost] = React.useState<WidgetPost | null>(null);
  const [listRefreshKey, setListRefreshKey] = React.useState(0);

  const apiBase = React.useMemo(() => ({ projectId, parentOrigin }), [projectId, parentOrigin]);
  const accent = resolveWidgetAccent(workspace?.primaryColor);
  const workspaceName = workspace?.name || "Feedback";
  const workspaceSlug = workspace?.slug || "";
  const workspaceLogo = workspace?.logo || null;

  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  React.useEffect(() => {
    if (!workspace) return;
    window.parent.postMessage(
      {
        source: "featul-widget-frame",
        type: "brand",
        payload: { primaryColor: accent, name: workspace.name },
      },
      "*",
    );
  }, [accent, workspace]);

  React.useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await client.widget.config.$get(apiBase);
        const data = await res.json();
        if (canceled) return;
        setWorkspace({
          id: data.workspace?.id || projectId,
          name: data.workspace?.name || "Feedback",
          slug: data.workspace?.slug || "",
          logo: data.workspace?.logo || null,
          primaryColor: data.workspace?.primaryColor || null,
          hideBranding: data.workspace?.hideBranding ?? null,
        });
        const enabledTabs: Section[] = data.config?.enabledTabs?.length
          ? (data.config.enabledTabs as Section[])
          : ["feedback", "roadmap", "changelog"];
        setTabs(["home", ...enabledTabs]);
        const nextBoards: Board[] = Array.isArray(data.boards) ? data.boards : [];
        setBoards(nextBoards);
        setListBoardId("");
      } catch {
        if (!canceled) setMessage("The widget could not load.");
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    window.parent.postMessage({ source: "featul-widget-frame", type: "ready" }, "*");
    return () => {
      canceled = true;
    };
  }, [apiBase, projectId]);

  React.useEffect(() => {
    async function loadLists() {
      try {
        if (section === "home" || section === "roadmap") {
          const fingerprint =
            userId || identity?.email ? undefined : await getBrowserFingerprint();
          const res = await client.widget.roadmap.$get({
            ...apiBase,
            userId: userId || undefined,
            identity:
              identity?.email
                ? {
                    id: identity.id,
                    email: identity.email,
                    name: identity.name,
                    avatar: identity.avatar,
                    signature: identity.signature,
                  }
                : undefined,
            fingerprint,
          });
          const data = await res.json();
          setRoadmap(Array.isArray(data.posts) ? (data.posts as WidgetRoadmapItem[]) : []);
        }
        if (section === "home" || section === "changelog") {
          const res = await client.widget.changelog.$get(apiBase);
          const data = await res.json();
          setChangelog(Array.isArray(data.entries) ? data.entries : []);
        }
      } catch {
        setMessage("Could not load this section.");
      }
    }
    loadLists();
  }, [apiBase, identity, section, userId]);

  React.useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (event.data?.source !== "featul-widget") return;
      if (event.data.type === "show" && event.data.payload?.section) {
        setSection(event.data.payload.section);
        if (event.data.payload.section === "feedback") {
          setFeedbackView("list");
          setSelectedPost(null);
        }
      }
      if (event.data.type === "identify") {
        const nextIdentity = event.data.payload as IdentifiedUser | null;
        setIdentity(nextIdentity);
        if (!nextIdentity?.email) return;
        try {
          const res = await client.widget.identify.$post({
            ...apiBase,
            user: { ...nextIdentity, email: nextIdentity.email },
          });
          const data = await res.json();
          setUserId(data.user?.id || null);
        } catch {
          setUserId(null);
          setMessage("Could not identify this user.");
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [apiBase]);

  const close = () => {
    window.parent.postMessage({ source: "featul-widget-frame", type: "close" }, "*");
  };

  const goFeedback = (view: FeedbackView = "list") => {
    setSection("feedback");
    setFeedbackView(view);
    if (view !== "detail") setSelectedPost(null);
  };

  const featuredEntry = changelog[0];
  const previewRoadmap = roadmap.slice(0, 4);
  const displayedTabs = tabs.filter((tab, index, list) => list.indexOf(tab) === index);
  const isFeedback = section === "feedback";
  const showTabs = !isFeedback || feedbackView === "list";
  const reduceMotion = useReducedMotion();
  const transformOrigin = initialPosition === "left" ? "bottom left" : "bottom right";
  const feedbackTitle =
    feedbackView === "compose"
      ? "Give feedback"
      : feedbackView === "detail"
        ? "Request"
        : "Feedback";

  return (
    <motion.main
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
      className="flex h-screen flex-col overflow-hidden rounded-md border border-white/10 bg-[#171717] text-white shadow-sm"
      style={
        {
          transformOrigin,
          ["--widget-accent" as string]: accent,
        } as React.CSSProperties
      }
    >
      {isFeedback && feedbackView !== "list" ? (
        <header className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => goFeedback("list")}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </button>
          {feedbackView === "detail" ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/[0.06]">
                {workspaceLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={workspaceLogo} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-[10px] font-semibold" style={{ color: accent }}>
                    {workspaceName.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{feedbackTitle}</p>
                <p className="truncate text-[10px] text-white/40">{workspaceName}</p>
              </div>
            </div>
          ) : (
            <p className="flex-1 text-[15px] font-semibold tracking-tight">{feedbackTitle}</p>
          )}
          <button
            type="button"
            onClick={close}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close widget"
          >
            <X className="size-4" />
          </button>
        </header>
      ) : (
        <header className="flex items-center gap-2.5 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/[0.06]">
            {workspaceLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspaceLogo} alt="" className="size-full object-cover" />
            ) : (
              <MessageSquare className="size-4 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">{workspaceName}</p>
          </div>
          <button
            type="button"
            onClick={() => goFeedback("compose")}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 text-xs font-semibold text-neutral-900 transition-opacity hover:opacity-90"
          >
            <Pencil className="size-3.5" />
            Give feedback
          </button>
          <button
            type="button"
            onClick={close}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close widget"
          >
            <X className="size-4" />
          </button>
        </header>
      )}

      <div
        className={
          isFeedback && (feedbackView === "list" || feedbackView === "detail")
            ? "relative flex min-h-0 flex-1 flex-col"
            : isFeedback
              ? "relative flex min-h-0 flex-1 flex-col px-5 pb-4"
              : "relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-1"
        }
      >
        {loading ? (
          <div
            className="flex min-h-0 flex-1 items-center justify-center"
            aria-label="Loading"
          >
            <LoaderIcon className="size-5 animate-spin text-white/45" />
          </div>
        ) : null}
        {!loading && message ? (
          <p className="mb-3 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/85">
            {message}
          </p>
        ) : null}

        {!loading && section === "home" ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => (featuredEntry ? setSection("changelog") : goFeedback("list"))}
              className="group relative w-full overflow-hidden rounded-md border border-white/8 bg-[#242424] p-5 text-left shadow-inner"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,.18) 1px, transparent 0), radial-gradient(ellipse at top right, ${accent}33, transparent 55%)`,
                  backgroundSize: "14px 14px, auto",
                }}
              />
              <div className="relative flex min-h-36 flex-col justify-end">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {workspaceLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={workspaceLogo}
                        alt=""
                        className="size-10 rounded-full border border-white/10 object-cover"
                      />
                    ) : (
                      <div
                        className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: accent }}
                      >
                        {workspaceName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{workspaceName}</p>
                      <p className="text-xs text-white/45">Product feedback</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-[#303030] px-2.5 py-2 text-center shadow-sm">
                    <p className="text-[10px] font-bold uppercase" style={{ color: accent }}>
                      New
                    </p>
                    <p className="text-lg font-semibold leading-none">{new Date().getDate()}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold" style={{ color: accent }}>
                  Built from feedback
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <h2 className="max-w-[250px] text-xl font-semibold leading-tight">
                    {featuredEntry?.title || "Share feedback without leaving the app"}
                  </h2>
                  <ChevronRight className="size-5 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </button>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="size-3.5" style={{ color: accent }} />
                  <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                    What&apos;s coming
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSection("roadmap")}
                  className="cursor-pointer text-xs text-white/50 hover:text-white"
                >
                  Roadmap →
                </button>
              </div>
              <div className="-mx-5">
                {previewRoadmap.length ? (
                  previewRoadmap.map((item) => (
                    <RoadmapRow
                      key={item.id}
                      item={item}
                      apiBase={apiBase}
                      userId={userId}
                      identity={identity}
                      onVoteChange={(id, upvotes, hasVoted) => {
                        setRoadmap((prev) =>
                          prev.map((row) =>
                            row.id === id ? { ...row, upvotes, hasVoted } : row,
                          ),
                        );
                      }}
                    />
                  ))
                ) : (
                  <p className="px-5 py-5 text-sm text-white/45">No public roadmap items yet.</p>
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={() => goFeedback("compose")}
              className="w-full rounded-md border border-white/8 bg-[#202020] px-5 py-4 text-left transition-colors hover:bg-[#242424]"
            >
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: accent }}>
                Share
              </p>
              <p className="mt-2 text-base font-semibold">Got a different idea?</p>
            </button>
          </div>
        ) : null}

        {!loading && section === "feedback" ? (
          feedbackView === "compose" ? (
            <WidgetFeedbackCompose
              apiBase={apiBase}
              boards={boards}
              userId={userId}
              identity={identity}
              primaryColor={accent}
              onCancel={() => goFeedback("list")}
              onCreated={(post) => {
                setSelectedPost(post);
                setListRefreshKey((value) => value + 1);
                setFeedbackView("detail");
                setMessage("Feedback submitted. Thank you.");
                window.setTimeout(() => setMessage(""), 2500);
              }}
            />
          ) : feedbackView === "detail" && selectedPost ? (
            <WidgetFeedbackDetail
              apiBase={apiBase}
              workspaceSlug={workspaceSlug}
              accent={accent}
              postId={selectedPost.id}
              initialPost={selectedPost}
              userId={userId}
              identity={identity}
            />
          ) : (
            <WidgetFeedbackList
              apiBase={apiBase}
              boards={boards}
              boardId={listBoardId}
              onBoardChange={setListBoardId}
              userId={userId}
              identity={identity}
              refreshKey={listRefreshKey}
              onCompose={() => goFeedback("compose")}
              onOpenPost={(post) => {
                setSelectedPost(post);
                setFeedbackView("detail");
              }}
            />
          )
        ) : null}

        {!loading && section === "roadmap" ? (
          <section className="-mx-1">
            <WidgetRoadmap
              items={roadmap}
              apiBase={apiBase}
              userId={userId}
              identity={identity}
              onVoteChange={(id, upvotes, hasVoted) => {
                setRoadmap((prev) =>
                  prev.map((row) => (row.id === id ? { ...row, upvotes, hasVoted } : row)),
                );
              }}
            />
          </section>
        ) : null}

        {!loading && section === "changelog" ? (
          <section className="space-y-2">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: accent }}>
                Updates
              </p>
              <h2 className="mt-2 text-xl font-semibold">Latest changes</h2>
            </div>
            {changelog.length ? (
              changelog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-white/8 bg-white/[0.04] px-4 py-3"
                >
                  <p className="text-sm font-medium">{entry.title}</p>
                  {entry.summary ? (
                    <p className="mt-1 line-clamp-3 text-xs text-white/45">{entry.summary}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-white/45">No updates published yet.</p>
            )}
          </section>
        ) : null}
      </div>

      {showTabs ? (
        <nav className="grid grid-cols-4 border-t border-white/10 px-3 py-2">
          {displayedTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setSection(tab);
                if (tab === "feedback") goFeedback("list");
              }}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
                section === tab ? "" : "text-white/45 hover:text-white/75"
              }`}
              style={section === tab ? { color: accent } : undefined}
            >
              {tab === "home" ? <Home className="size-4" /> : null}
              {tab === "feedback" ? <MessageSquare className="size-4" /> : null}
              {tab === "roadmap" ? <Map className="size-4" /> : null}
              {tab === "changelog" ? <Megaphone className="size-4" /> : null}
              <span>
                {tab === "changelog" ? "Updates" : `${tab.charAt(0).toUpperCase()}${tab.slice(1)}`}
              </span>
            </button>
          ))}
        </nav>
      ) : null}

      {!workspace?.hideBranding && !(isFeedback && feedbackView === "compose") ? (
        <div className="border-t border-white/10 px-4 py-2.5 text-center">
          <a
            href="https://featul.com?utm_source=powered_by&utm_medium=referral&utm_campaign=widget"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] text-white/35 transition-colors hover:text-white/60"
          >
            <span>Powered by featul</span>
            <FeatulLogoIcon className="size-3.5 shrink-0" size={14} />
          </a>
        </div>
      ) : null}
    </motion.main>
  );
}

function RoadmapRow({
  item,
  apiBase,
  userId,
  identity,
  onVoteChange,
}: {
  item: {
    id: string;
    title: string;
    roadmapStatus: string | null;
    upvotes: number | null;
    hasVoted?: boolean;
    authorName?: string | null;
    authorImage?: string | null;
    isAnonymous?: boolean | null;
  };
  apiBase: { projectId: string; parentOrigin: string };
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
}) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest";

  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.03]">
      <WidgetAuthorAvatar name={author} image={item.authorImage} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs capitalize text-white/45">
          <StatusIcon status={item.roadmapStatus || undefined} className="size-3.5" />
          {statusLabel(String(item.roadmapStatus || "planned"))}
        </p>
      </div>
      <WidgetVoteButton
        postId={item.id}
        upvotes={item.upvotes || 0}
        hasVoted={Boolean(item.hasVoted)}
        apiBase={apiBase}
        userId={userId}
        identity={identity}
        variant="plain"
        onChange={({ upvotes, hasVoted }) => onVoteChange?.(item.id, upvotes, hasVoted)}
      />
    </div>
  );
}
