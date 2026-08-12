"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
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
import { FillChangelogIcon } from "@featul/ui/icons/fill-changelog";
import { FillFeedbackIcon } from "@featul/ui/icons/fill-feedback";
import { FillPenIcon } from "@featul/ui/icons/fill-pen";
import { FillRoadmapIcon } from "@featul/ui/icons/fill-roadmap";
import { HomeIcon } from "@featul/ui/icons/home";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { resolveWidgetAccent, resolveWidgetTheme, widgetThemeVars } from "./theme";
import { WidgetThemeProvider } from "./WidgetThemeProvider";
import { WidgetAuthorAvatar } from "./AuthorAvatar";
import { WidgetVoteButton } from "./VoteButton";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { extractTextFromTiptap } from "@/types/changelog";
import { toShortPreview } from "./utils";

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
  initialTheme,
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
    Array<{
      id: string;
      title: string;
      summary: string | null;
      preview?: string | null;
      publishedAt: string | null;
      authorName?: string | null;
      authorImage?: string | null;
      authorRoleLabel?: string | null;
    }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [selectedPost, setSelectedPost] = React.useState<WidgetPost | null>(null);
  const [listRefreshKey, setListRefreshKey] = React.useState(0);
  const [navBorderVisible, setNavBorderVisible] = React.useState(false);
  const [themeMode, setThemeMode] = React.useState<"light" | "dark" | "auto">(initialTheme);
  const [theme, setTheme] = React.useState<"light" | "dark">(() => resolveWidgetTheme(initialTheme));
  const navBorderTimeoutRef = React.useRef<number | null>(null);

  const apiBase = React.useMemo(() => ({ projectId, parentOrigin }), [projectId, parentOrigin]);
  const accent = resolveWidgetAccent(workspace?.primaryColor);
  const workspaceName = workspace?.name || "Feedback";
  const workspaceSlug = workspace?.slug || "";
  const workspaceLogo = workspace?.logo || null;

  React.useEffect(() => {
    const applyTheme = (next: "light" | "dark") => {
      setTheme(next);
      document.documentElement.style.colorScheme = next;
      document.body.style.background = next === "light" ? "#ffffff" : "#000000";
    };

    applyTheme(resolveWidgetTheme(themeMode));
    if (themeMode !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(resolveWidgetTheme("auto"));
    if (typeof media.addEventListener === "function") media.addEventListener("change", onChange);
    else media.addListener(onChange);
    return () => {
      if (typeof media.removeEventListener === "function") media.removeEventListener("change", onChange);
      else media.removeListener(onChange);
    };
  }, [themeMode]);

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
          const entries = Array.isArray(data.entries) ? data.entries : [];
          setChangelog(
            entries.map((entry: any) => {
              const summary =
                typeof entry?.summary === "string" && entry.summary.trim()
                  ? entry.summary.trim()
                  : null;
              const fromContent = extractTextFromTiptap(entry?.content);
              const rawPreview =
                (typeof entry?.preview === "string" && entry.preview.trim()
                  ? entry.preview.trim()
                  : null) ||
                summary ||
                (fromContent ? fromContent.trim() : null);
              const preview = rawPreview ? toShortPreview(rawPreview, 2) : null;
              const authorName =
                (typeof entry?.authorName === "string" && entry.authorName.trim()
                  ? entry.authorName.trim()
                  : null) ||
                (typeof entry?.author?.name === "string" && entry.author.name.trim()
                  ? entry.author.name.trim()
                  : null);
              const authorImage =
                (typeof entry?.authorImage === "string" && entry.authorImage.trim()
                  ? entry.authorImage.trim()
                  : null) ||
                (typeof entry?.author?.image === "string" && entry.author.image.trim()
                  ? entry.author.image.trim()
                  : null);
              const authorIsOwner = Boolean(entry?.authorIsOwner ?? entry?.author?.isOwner);
              const authorRole =
                (typeof entry?.authorRole === "string" ? entry.authorRole : null) ||
                (typeof entry?.author?.role === "string" ? entry.author.role : null);
              const authorRoleLabel =
                (typeof entry?.authorRoleLabel === "string" && entry.authorRoleLabel.trim()
                  ? entry.authorRoleLabel.trim()
                  : null) ||
                (typeof entry?.author?.roleLabel === "string" && entry.author.roleLabel.trim()
                  ? entry.author.roleLabel.trim()
                  : null) ||
                (authorIsOwner
                  ? "Founder"
                  : authorRole === "admin"
                    ? "Admin"
                    : authorRole === "member"
                      ? "Member"
                      : authorRole === "viewer"
                        ? "Viewer"
                        : null);

              return {
                id: String(entry?.id || ""),
                title: String(entry?.title || ""),
                summary,
                preview,
                publishedAt:
                  entry?.publishedAt instanceof Date
                    ? entry.publishedAt.toISOString()
                    : typeof entry?.publishedAt === "string"
                      ? entry.publishedAt
                      : null,
                authorName,
                authorImage,
                authorRoleLabel,
              };
            }),
          );
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
      if (event.data.type === "theme") {
        const mode = (event.data.payload?.mode || event.data.payload?.theme || "auto") as
          | "light"
          | "dark"
          | "auto";
        if (mode === "light" || mode === "dark" || mode === "auto") {
          setThemeMode(mode);
        }
        return;
      }
      if (event.data.type === "show") {
        if (event.data.payload?.section) {
          setSection(event.data.payload.section);
          if (event.data.payload.section === "feedback") {
            setFeedbackView("list");
            setSelectedPost(null);
          }
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

  const reduceMotion = useReducedMotion();

  const close = () => {
    window.parent.postMessage({ source: "featul-widget-frame", type: "close" }, "*");
  };

  const goFeedback = (view: FeedbackView = "list") => {
    setSection("feedback");
    setFeedbackView(view);
    if (view !== "detail") setSelectedPost(null);
  };

  React.useEffect(() => {
    const showNavBorder = () => {
      setNavBorderVisible(true);
      if (navBorderTimeoutRef.current !== null) {
        window.clearTimeout(navBorderTimeoutRef.current);
      }
      navBorderTimeoutRef.current = window.setTimeout(() => {
        setNavBorderVisible(false);
        navBorderTimeoutRef.current = null;
      }, 220);
    };

    // Capture scrolls from any nested scroller (home, roadmap, feedback list, etc.)
    document.addEventListener("scroll", showNavBorder, true);
    return () => {
      document.removeEventListener("scroll", showNavBorder, true);
      if (navBorderTimeoutRef.current !== null) {
        window.clearTimeout(navBorderTimeoutRef.current);
      }
    };
  }, []);

  const featuredEntry = changelog[0];
  const previewRoadmap = roadmap.slice(0, 4);
  const displayedTabs = tabs.filter((tab, index, list) => list.indexOf(tab) === index);
  const isFeedback = section === "feedback";
  const showTabs = !isFeedback || feedbackView === "list";
  const contentKey = isFeedback ? `feedback-${feedbackView}` : section;
  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };
  const feedbackTitle =
    feedbackView === "compose"
      ? "Give feedback"
      : feedbackView === "detail"
        ? "Request"
        : "Feedback";

  return (
    <WidgetThemeProvider mode={themeMode}>
    <motion.main
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }
      }
      className="flex h-screen flex-col overflow-hidden rounded-xl border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-surface))] text-[rgb(var(--widget-fg))] shadow-sm"
      style={
        {
          ["--widget-accent" as string]: accent,
          backgroundColor: theme === "light" ? "#ffffff" : "#000000",
          color: theme === "light" ? "#171717" : "#ffffff",
          ...widgetThemeVars(theme),
        } as React.CSSProperties
      }
    >
      {isFeedback && feedbackView !== "list" ? (
        <header className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => goFeedback("list")}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-[rgb(var(--widget-fg)/0.55)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </button>
          {feedbackView === "detail" ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.06)]">
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
                <p className="truncate text-[10px] text-[rgb(var(--widget-fg)/0.4)]">{workspaceName}</p>
              </div>
            </div>
          ) : (
            <p className="flex-1 text-[15px] font-semibold tracking-tight">{feedbackTitle}</p>
          )}
          <button
            type="button"
            onClick={close}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
            aria-label="Close widget"
          >
            <X className="size-4" />
          </button>
        </header>
      ) : (
        <header className="flex items-center gap-2.5 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.06)]">
            {workspaceLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspaceLogo} alt="" className="size-full object-cover" />
            ) : (
              <FillFeedbackIcon className="size-4 text-[rgb(var(--widget-fg))]" size={16} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">{workspaceName}</p>
          </div>
          <button
            type="button"
            onClick={() => goFeedback("compose")}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[rgb(var(--widget-cta))] px-3 text-xs font-semibold text-[rgb(var(--widget-cta-fg))] transition-opacity hover:opacity-90"
          >
            <FillPenIcon className="size-3.5" size={14} />
            Give feedback
          </button>
          <button
            type="button"
            onClick={close}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
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
              : section === "roadmap"
                ? "relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-5 pt-0"
                : section === "home"
                  ? "relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-4"
                  : "relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-3"
        }
        data-widget-scroll={
          !(isFeedback && (feedbackView === "list" || feedbackView === "detail"))
            ? ""
            : undefined
        }
      >
        {loading ? (
          <motion.div
            key="loading"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={contentTransition}
            className="flex min-h-0 flex-1 items-center justify-center"
            aria-label="Loading"
          >
            <LoaderIcon className="size-5 animate-spin text-[rgb(var(--widget-fg)/0.45)]" />
          </motion.div>
        ) : null}
        {!loading && message ? (
          <p className="mb-3 rounded-md border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.08)] px-3 py-2 text-sm text-[rgb(var(--widget-fg)/0.85)]">
            {message}
          </p>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {!loading && section === "home" ? (
          <motion.div
            key="home"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={contentTransition}
            className="space-y-6"
          >
            <button
              type="button"
              onClick={() => setSection("changelog")}
              className="group w-full text-left"
            >
              {featuredEntry ? (
                <>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: accent }}
                  >
                    {featuredEntry.publishedAt
                      ? `Released · ${new Date(featuredEntry.publishedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}`
                      : "Latest update"}
                  </p>
                  <h2 className="mt-3 text-[22px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
                    {featuredEntry.title}
                  </h2>
                  {featuredEntry.preview ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.55)]">
                      {featuredEntry.preview}
                    </p>
                  ) : null}
                  {(featuredEntry.authorName || featuredEntry.authorImage) ? (
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <WidgetAuthorAvatar
                          name={featuredEntry.authorName || "Author"}
                          image={featuredEntry.authorImage}
                          className="size-7"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[rgb(var(--widget-fg))]">
                            {featuredEntry.authorName || "Author"}
                          </p>
                          <p
                            className="truncate text-xs font-medium"
                            style={{ color: accent }}
                          >
                            {featuredEntry.authorRoleLabel || "Team"}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[rgb(var(--widget-fg)/0.4)] transition-colors group-hover:text-[rgb(var(--widget-fg)/0.7)]">
                        View updates
                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  ) : (
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-[rgb(var(--widget-fg)/0.4)] transition-colors group-hover:text-[rgb(var(--widget-fg)/0.7)]">
                      View updates
                      <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  )}
                </>
              ) : (
                <>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: accent }}
                  >
                    Updates
                  </p>
                  <h2 className="mt-3 text-[22px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
                    No updates yet
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.5)]">
                    New releases and product changes will show up here.
                  </p>
                </>
              )}
            </button>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="size-3.5" style={{ color: accent }} />
                  <p className="text-xs font-semibold tracking-wide text-[rgb(var(--widget-fg)/0.8)]">
                    What&apos;s coming
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSection("roadmap")}
                  className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.5)] hover:text-[rgb(var(--widget-fg))]"
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
                  <p className="px-5 py-5 text-sm text-[rgb(var(--widget-fg)/0.45)]">No public roadmap items yet.</p>
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={() => goFeedback("compose")}
              className="flex w-full cursor-pointer items-center justify-between rounded-md bg-[rgb(var(--widget-cta))] px-4 py-3 text-left transition-opacity hover:opacity-90"
            >
              <div>
                <p className="text-sm font-semibold text-[rgb(var(--widget-cta-fg))]">Give feedback</p>
                <p className="mt-0.5 text-xs text-neutral-500">Share an idea or report an issue</p>
              </div>
              <FillPenIcon className="size-4 shrink-0 text-[rgb(var(--widget-cta-fg)/0.7)]" size={16} />
            </button>
          </motion.div>
          ) : null}

          {!loading && section === "feedback" ? (
          <motion.div
            key={contentKey}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={contentTransition}
            className="flex min-h-0 flex-1 flex-col"
          >
          {feedbackView === "compose" ? (
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
          )}
          </motion.div>
          ) : null}

          {!loading && section === "roadmap" ? (
          <motion.div
            key="roadmap"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={contentTransition}
            className="flex min-h-0 flex-1 flex-col"
          >
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
          </motion.div>
          ) : null}

          {!loading && section === "changelog" ? (
          <motion.section
            key="changelog"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={contentTransition}
            className="space-y-2"
          >
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
                  className="rounded-md border border-[rgb(var(--widget-fg)/0.08)] bg-[rgb(var(--widget-fg)/0.04)] px-4 py-3"
                >
                  <p className="text-sm font-medium">{entry.title}</p>
                  {entry.preview ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
                      {entry.preview}
                    </p>
                  ) : null}
                  {entry.authorName ? (
                    <div className="mt-3 flex items-center gap-2">
                      <WidgetAuthorAvatar
                        name={entry.authorName}
                        image={entry.authorImage}
                        className="size-5"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-[rgb(var(--widget-fg)/0.8)]">
                          {entry.authorName}
                        </p>
                        <p className="truncate text-[10px] font-medium" style={{ color: accent }}>
                          {entry.authorRoleLabel || "Team"}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-[rgb(var(--widget-fg)/0.45)]">No updates published yet.</p>
            )}
          </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      {showTabs ? (
        <nav
          className={`grid grid-cols-4 px-3 py-2 transition-[box-shadow] duration-200 ${
            navBorderVisible
              ? "shadow-[inset_0_1px_0_0_rgb(var(--widget-fg)/0.08)]"
              : "shadow-[inset_0_1px_0_0_transparent]"
          }`}
        >
          {displayedTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setSection(tab);
                if (tab === "feedback") goFeedback("list");
              }}
              className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
                section === tab ? "" : "text-[rgb(var(--widget-fg)/0.45)] hover:text-[rgb(var(--widget-fg)/0.75)]"
              }`}
              style={section === tab ? { color: accent } : undefined}
            >
              {tab === "home" ? <HomeIcon className="size-4" size={16} /> : null}
              {tab === "feedback" ? <FillFeedbackIcon className="size-4" size={16} /> : null}
              {tab === "roadmap" ? <FillRoadmapIcon className="size-4" size={16} /> : null}
              {tab === "changelog" ? <FillChangelogIcon className="size-4" size={16} /> : null}
              <span>
                {tab === "changelog" ? "Updates" : `${tab.charAt(0).toUpperCase()}${tab.slice(1)}`}
              </span>
            </button>
          ))}
        </nav>
      ) : null}

      {!workspace?.hideBranding && !(isFeedback && feedbackView === "compose") ? (
        <div className="border-t border-[rgb(var(--widget-fg)/0.1)] px-4 py-2.5 text-center">
          <a
            href="https://featul.com?utm_source=powered_by&utm_medium=referral&utm_campaign=widget"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] text-[rgb(var(--widget-fg)/0.35)] transition-colors hover:text-[rgb(var(--widget-fg)/0.6)]"
          >
            <span>Powered by featul</span>
            <FeatulLogoIcon className="size-3.5 shrink-0" size={14} />
          </a>
        </div>
      ) : null}
    </motion.main>
    </WidgetThemeProvider>
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
    <div className="flex items-center gap-3 border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-3.5 transition-colors last:border-b-0 hover:bg-[rgb(var(--widget-fg)/0.03)]">
      <WidgetAuthorAvatar name={author} image={item.authorImage} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs capitalize text-[rgb(var(--widget-fg)/0.45)]">
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
