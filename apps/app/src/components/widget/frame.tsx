"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
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
import { resolveWidgetAccent, resolveWidgetTheme, widgetSurfaceHex, widgetThemeVars } from "./theme";
import { WidgetThemeProvider } from "./WidgetThemeProvider";
import { WidgetAuthorAvatar } from "./AuthorAvatar";
import { WidgetVoteButton } from "./VoteButton";
import StatusIcon from "@/components/requests/StatusIcon";
import { normalizeRoadmapStatus } from "@/lib/roadmap";
import { extractTextFromTiptap } from "@/types/changelog";
import { WidgetUpdates, UpdateMetaRow, type WidgetChangelogEntry } from "./Updates";
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
  const [changelog, setChangelog] = React.useState<WidgetChangelogEntry[]>([]);
  const [selectedChangelogId, setSelectedChangelogId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [selectedPost, setSelectedPost] = React.useState<WidgetPost | null>(null);
  const [listRefreshKey, setListRefreshKey] = React.useState(0);
  const [listVotePatch, setListVotePatch] = React.useState<{
    postId: string;
    upvotes: number;
    hasVoted: boolean;
  } | null>(null);
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
      document.body.style.background = widgetSurfaceHex(next);
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
        if (section === "home" || section === "changelog" || section === "roadmap") {
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
              const preview = rawPreview ? toShortPreview(rawPreview, 3) : null;
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
              const tags = Array.isArray(entry?.tags)
                ? entry.tags
                    .filter(
                      (tag: any) =>
                        tag &&
                        typeof tag.id === "string" &&
                        typeof tag.name === "string" &&
                        tag.name.trim(),
                    )
                    .map((tag: any) => ({
                      id: String(tag.id),
                      name: String(tag.name),
                      color: typeof tag.color === "string" ? tag.color : null,
                    }))
                : [];

              return {
                id: String(entry?.id || ""),
                title: String(entry?.title || ""),
                slug: typeof entry?.slug === "string" ? entry.slug : undefined,
                summary,
                preview,
                content: entry?.content ?? null,
                coverImage:
                  typeof entry?.coverImage === "string" && entry.coverImage.trim()
                    ? entry.coverImage.trim()
                    : null,
                publishedAt:
                  entry?.publishedAt instanceof Date
                    ? entry.publishedAt.toISOString()
                    : typeof entry?.publishedAt === "string"
                      ? entry.publishedAt
                      : null,
                tags,
                authorName,
                authorImage,
                authorRoleLabel,
              } satisfies WidgetChangelogEntry;
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
  const homeRoadmap = React.useMemo(() => {
    const progress = roadmap.filter(
      (item) => normalizeRoadmapStatus(item.roadmapStatus, "planned") === "progress",
    );
    const rest = roadmap.filter(
      (item) => normalizeRoadmapStatus(item.roadmapStatus, "planned") !== "progress",
    );
    return [...progress, ...rest].slice(0, 5);
  }, [roadmap]);
  const homeChangelog = changelog.slice(0, 5);
  const homeRoadmapLabel = homeRoadmap.some(
    (item) => normalizeRoadmapStatus(item.roadmapStatus, "planned") === "progress",
  )
    ? "In progress"
    : "Roadmap";
  const displayedTabs = tabs.filter((tab, index, list) => list.indexOf(tab) === index);
  const isFeedback = section === "feedback";
  const isChangelogDetail = section === "changelog" && Boolean(selectedChangelogId);
  const showTabs = (!isFeedback || feedbackView === "list") && !isChangelogDetail;
  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };
  const feedbackTitle =
    feedbackView === "compose"
      ? "Give feedback"
      : feedbackView === "detail"
        ? "Request"
        : "Feedback";
  const showSubpageHeader =
    (isFeedback && feedbackView !== "list") || isChangelogDetail;

  React.useEffect(() => {
    window.parent.postMessage(
      {
        source: "featul-widget-frame",
        type: "panel",
        payload: { expanded: isChangelogDetail },
      },
      "*",
    );
  }, [isChangelogDetail]);

  const prevSectionRef = React.useRef(section);
  React.useEffect(() => {
    const prev = prevSectionRef.current;
    prevSectionRef.current = section;
    if (prev === "changelog" && section !== "changelog") {
      setSelectedChangelogId(null);
    }
  }, [section]);

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
          backgroundColor: widgetSurfaceHex(theme),
          color: theme === "light" ? "#171717" : "#fafafa",
          ...widgetThemeVars(theme),
        } as React.CSSProperties
      }
    >
      <header className="flex items-center gap-2.5 px-4 py-3">
        {showSubpageHeader ? (
          <button
            type="button"
            onClick={() => {
              if (isChangelogDetail) {
                setSelectedChangelogId(null);
                return;
              }
              goFeedback("list");
            }}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-transparent text-[rgb(var(--widget-fg)/0.55)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.06)]">
            {workspaceLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspaceLogo} alt="" className="size-full object-cover" />
            ) : (
              <FillFeedbackIcon className="size-4 text-[rgb(var(--widget-fg))]" size={16} />
            )}
          </div>
        )}

        {isFeedback && feedbackView === "detail" ? (
          <div className="min-w-0 flex-1" />
        ) : isChangelogDetail ? (
          <div className="min-w-0 flex-1" />
        ) : isFeedback && feedbackView === "compose" ? (
          <p className="min-w-0 flex-1 text-[15px] font-semibold tracking-tight">{feedbackTitle}</p>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">{workspaceName}</p>
          </div>
        )}

        {!showSubpageHeader ? (
          <button
            type="button"
            onClick={() => goFeedback("compose")}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[rgb(var(--widget-cta))] px-3 text-xs font-semibold text-[rgb(var(--widget-cta-fg))] transition-opacity hover:opacity-90"
          >
            <FillPenIcon className="size-3.5" size={14} />
            Give feedback
          </button>
        ) : null}

        <button
          type="button"
          onClick={close}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
          aria-label="Close widget"
        >
          <X className="size-4" />
        </button>
      </header>

      <div
        className={
          isFeedback && (feedbackView === "list" || feedbackView === "detail")
            ? "relative flex min-h-0 flex-1 flex-col"
            : isChangelogDetail || section === "changelog"
              ? "relative flex min-h-0 flex-1 flex-col overflow-hidden"
            : isFeedback
              ? "relative flex min-h-0 flex-1 flex-col px-5 pb-4"
              : section === "roadmap"
                ? "relative flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide pb-5 pt-0"
                : section === "home"
                  ? "relative flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide pb-5 pt-4"
                  : "relative flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide px-5 pb-5 pt-3"
        }
        data-widget-scroll=""
      >
        {loading ? (
          <motion.div
            key="loading"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
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

        {!loading && section === "home" ? (
          <motion.div
            key="home"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={contentTransition}
            className="space-y-0"
          >
            <button
              type="button"
              onClick={() => {
                if (!featuredEntry) {
                  setSection("changelog");
                  return;
                }
                setSelectedChangelogId(featuredEntry.id);
                setSection("changelog");
              }}
              className="group w-full border-b border-[rgb(var(--widget-fg)/0.1)] px-5 pb-6 text-left"
            >
              {featuredEntry ? (
                <>
                  <UpdateMetaRow entry={featuredEntry} accent={accent} fallbackBadge="Just Shipped" />
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
                            className="truncate font-heading text-xs font-medium"
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

            <div className="border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-5">
              <button
                type="button"
                onClick={() => goFeedback("compose")}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-md bg-[rgb(var(--widget-fg)/0.03)] px-3.5 py-3.5 text-left transition-colors hover:bg-[rgb(var(--widget-fg)/0.055)]"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgb(var(--widget-fg)/0.06)]"
                  style={{ color: accent }}
                >
                  <FillPenIcon className="size-4" size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-sm font-semibold tracking-tight text-[rgb(var(--widget-fg))]">
                    Give feedback
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-[rgb(var(--widget-fg)/0.45)]">
                    Share an idea or report an issue
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-[rgb(var(--widget-fg)/0.3)] transition-transform group-hover:translate-x-0.5 group-hover:text-[rgb(var(--widget-fg)/0.55)]" />
              </button>
            </div>

            <section className="border-b border-[rgb(var(--widget-fg)/0.1)] py-5">
              <div className="mb-3 flex items-center justify-between gap-3 px-5">
                <div className="flex items-center gap-2">
                  <StatusIcon status="progress" className="size-3.5" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
                    {homeRoadmapLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSection("roadmap")}
                  className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.75)]"
                >
                  See roadmap →
                </button>
              </div>
              <div>
                {homeRoadmap.length ? (
                  homeRoadmap.map((item) => (
                    <RoadmapRow
                      key={item.id}
                      item={item}
                      apiBase={apiBase}
                      userId={userId}
                      identity={identity}
                      onOpen={() => {
                        setSelectedPost({
                          id: item.id,
                          title: item.title,
                          slug: item.slug || item.id,
                          content: item.content ?? null,
                          upvotes: item.upvotes,
                          commentCount: null,
                          roadmapStatus: item.roadmapStatus,
                          createdAt: item.createdAt ?? null,
                          boardId: "",
                          boardName: null,
                          boardSlug: null,
                          isAnonymous: item.isAnonymous ?? null,
                          authorName: item.authorName ?? null,
                          authorImage: item.authorImage ?? null,
                          hasVoted: Boolean(item.hasVoted),
                        });
                        setSection("feedback");
                        setFeedbackView("detail");
                      }}
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
                  <p className="px-5 py-4 text-sm text-[rgb(var(--widget-fg)/0.45)]">
                    No public roadmap items yet.
                  </p>
                )}
              </div>
            </section>

            <section className="py-5">
              <div className="mb-3 flex items-center justify-between gap-3 px-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
                  Updates
                </p>
                <button
                  type="button"
                  onClick={() => setSection("changelog")}
                  className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.75)]"
                >
                  See updates →
                </button>
              </div>
              {homeChangelog.length ? (
                <div>
                  {homeChangelog.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setSelectedChangelogId(entry.id);
                        setSection("changelog");
                      }}
                      className="flex w-full flex-col items-start gap-1.5 border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[rgb(var(--widget-fg)/0.03)]"
                    >
                      <UpdateMetaRow entry={entry} accent={accent} fallbackBadge="Just Shipped" />
                      <span className="min-w-0 text-sm font-medium leading-snug text-[rgb(var(--widget-fg))]">
                        {entry.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-4 text-sm text-[rgb(var(--widget-fg)/0.45)]">
                  No updates published yet.
                </p>
              )}
            </section>
          </motion.div>
        ) : null}

        {!loading && section === "feedback" ? (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              className={
                feedbackView === "list"
                  ? "flex min-h-0 flex-1 flex-col"
                  : "pointer-events-none invisible absolute inset-0 flex flex-col"
              }
              aria-hidden={feedbackView !== "list"}
            >
              <WidgetFeedbackList
                apiBase={apiBase}
                boards={boards}
                boardId={listBoardId}
                onBoardChange={setListBoardId}
                userId={userId}
                identity={identity}
                refreshKey={listRefreshKey}
                active={feedbackView === "list"}
                votePatch={listVotePatch}
                onCompose={() => goFeedback("compose")}
                onOpenPost={(post) => {
                  setSelectedPost(post);
                  setFeedbackView("detail");
                }}
              />
            </div>

            {feedbackView === "compose" ? (
              <motion.div
                key="feedback-compose"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={contentTransition}
                className="flex min-h-0 flex-1 flex-col"
              >
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
              </motion.div>
            ) : null}

            {feedbackView === "detail" && selectedPost ? (
              <motion.div
                key={`feedback-detail-${selectedPost.id}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={contentTransition}
                className="flex min-h-0 flex-1 flex-col"
              >
                <WidgetFeedbackDetail
                  apiBase={apiBase}
                  workspaceSlug={workspaceSlug}
                  accent={accent}
                  postId={selectedPost.id}
                  initialPost={selectedPost}
                  userId={userId}
                  identity={identity}
                  onVoteChange={(postId, upvotes, hasVoted) => {
                    setSelectedPost((prev) =>
                      prev && prev.id === postId ? { ...prev, upvotes, hasVoted } : prev,
                    );
                    setListVotePatch({ postId, upvotes, hasVoted });
                  }}
                />
              </motion.div>
            ) : null}
          </div>
        ) : null}

        {!loading && section === "roadmap" ? (
          <motion.div
            key="roadmap"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={contentTransition}
            className="flex min-h-0 flex-1 flex-col"
          >
            {homeChangelog.length ? (
              <section className="border-b border-[rgb(var(--widget-fg)/0.1)] pb-4 pt-1">
                <div className="mb-2 flex items-center justify-between gap-3 px-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
                    Recent updates
                  </p>
                  <button
                    type="button"
                    onClick={() => setSection("changelog")}
                    className="cursor-pointer text-xs text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.75)]"
                  >
                    See updates →
                  </button>
                </div>
                <div>
                  {homeChangelog.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setSelectedChangelogId(entry.id);
                        setSection("changelog");
                      }}
                      className="flex w-full flex-col items-start gap-1.5 border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-[rgb(var(--widget-fg)/0.03)]"
                    >
                      <UpdateMetaRow entry={entry} accent={accent} fallbackBadge="Just Shipped" />
                      <span className="min-w-0 text-sm font-medium leading-snug text-[rgb(var(--widget-fg))]">
                        {entry.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
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
          <motion.div
            key="changelog"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={contentTransition}
            className="flex min-h-0 flex-1 flex-col"
          >
            <WidgetUpdates
              entries={changelog}
              accent={accent}
              selectedId={selectedChangelogId}
              onOpen={(entry) => setSelectedChangelogId(entry.id)}
              onBack={() => setSelectedChangelogId(null)}
            />
          </motion.div>
        ) : null}
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

      {!workspace?.hideBranding &&
      !(isFeedback && (feedbackView === "compose" || feedbackView === "detail")) &&
      !isChangelogDetail ? (
        <div className="border-t border-[rgb(var(--widget-fg)/0.1)] px-4 py-1 text-center">
          <a
            href="https://featul.com?utm_source=powered_by&utm_medium=referral&utm_campaign=widget"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] leading-none text-[rgb(var(--widget-fg)/0.35)] transition-colors hover:text-[rgb(var(--widget-fg)/0.6)]"
          >
            <span>Powered by featul</span>
            <FeatulLogoIcon className="size-3 shrink-0" size={12} />
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
  onOpen,
  onVoteChange,
}: {
  item: {
    id: string;
    title: string;
    slug?: string | null;
    content?: string | null;
    roadmapStatus: string | null;
    upvotes: number | null;
    hasVoted?: boolean;
    authorName?: string | null;
    authorImage?: string | null;
    isAnonymous?: boolean | null;
    createdAt?: string | Date | null;
  };
  apiBase: { projectId: string; parentOrigin: string };
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onOpen?: () => void;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
}) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest";

  return (
    <div className="relative border-b border-[rgb(var(--widget-fg)/0.1)] transition-colors last:border-b-0 hover:bg-[rgb(var(--widget-fg)/0.03)]">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 pr-16 text-left"
        aria-label={item.title}
      >
        <WidgetAuthorAvatar name={author} image={item.authorImage} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="mt-1 truncate text-xs text-[rgb(var(--widget-fg)/0.45)]">{author}</p>
        </div>
      </button>
      <div className="absolute right-5 top-1/2 -translate-y-1/2">
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
    </div>
  );
}
