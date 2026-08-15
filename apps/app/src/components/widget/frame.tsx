"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { client } from "@featul/api/client";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { normalizeRoadmapStatus } from "@/lib/roadmap";
import { WidgetFeedbackCompose } from "./compose";
import { WidgetFeedbackDetail } from "./detail";
import { Header } from "./header";
import { Home } from "./home";
import { mapChangelogEntries } from "./load";
import { WidgetFeedbackList } from "./list";
import { isHostMessage, MessagingProvider, postToParent } from "./messaging";
import { Nav } from "./nav";
import { WidgetRoadmap, type WidgetRoadmapItem } from "./roadmap";
import { Theme, resolveWidgetAccent, resolveWidgetTheme, widgetSurfaceHex, widgetThemeVars } from "./theme";
import type {
  Board,
  FeedbackView,
  IdentifiedUser,
  Section,
  WidgetPost,
  WidgetWorkspace,
} from "./types";
import { WidgetUpdates, type WidgetChangelogEntry } from "./updates";

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
    postToParent(parentOrigin, "brand", { primaryColor: accent, name: workspace.name });
  }, [accent, parentOrigin, workspace]);

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
    postToParent(parentOrigin, "ready");
    return () => {
      canceled = true;
    };
  }, [apiBase, parentOrigin, projectId]);

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
          setChangelog(mapChangelogEntries(entries));
        }
      } catch {
        setMessage("Could not load this section.");
      }
    }
    loadLists();
  }, [apiBase, identity, section, userId]);

  React.useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (!isHostMessage(event, parentOrigin)) return;
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
          const data = (await res.json()) as { user?: { id?: string } | null };
          setUserId(data.user?.id || null);
        } catch {
          setUserId(null);
          setMessage("Could not identify this user.");
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [apiBase, parentOrigin]);

  const reduceMotion = useReducedMotion();

  const close = () => {
    postToParent(parentOrigin, "close");
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
    postToParent(parentOrigin, "panel", { expanded: isChangelogDetail });
  }, [isChangelogDetail, parentOrigin]);

  const prevSectionRef = React.useRef(section);
  React.useEffect(() => {
    const prev = prevSectionRef.current;
    prevSectionRef.current = section;
    if (prev === "changelog" && section !== "changelog") {
      setSelectedChangelogId(null);
    }
  }, [section]);

  return (
    <MessagingProvider parentOrigin={parentOrigin}>
    <Theme mode={themeMode}>
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
      <Header
        workspaceName={workspaceName}
        workspaceLogo={workspaceLogo}
        showSubpageHeader={showSubpageHeader}
        isChangelogDetail={isChangelogDetail}
        isFeedback={isFeedback}
        feedbackView={feedbackView}
        feedbackTitle={feedbackTitle}
        onBack={() => {
          if (isChangelogDetail) {
            setSelectedChangelogId(null);
            return;
          }
          goFeedback("list");
        }}
        onCompose={() => goFeedback("compose")}
        onClose={close}
      />

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
          >
            <Home
              featuredEntry={featuredEntry}
              homeRoadmap={homeRoadmap}
              homeChangelog={homeChangelog}
              homeRoadmapLabel={homeRoadmapLabel}
              accent={accent}
              apiBase={apiBase}
              userId={userId}
              identity={identity}
              onOpenChangelog={(id) => {
                if (id) setSelectedChangelogId(id);
                setSection("changelog");
              }}
              onSeeUpdates={() => setSection("changelog")}
              onSeeRoadmap={() => setSection("roadmap")}
              onCompose={() => goFeedback("compose")}
              onOpenRoadmapItem={(post) => {
                setSelectedPost(post);
                setSection("feedback");
                setFeedbackView("detail");
              }}
              onVoteChange={(id, upvotes, hasVoted) => {
                setRoadmap((prev) =>
                  prev.map((row) => (row.id === id ? { ...row, upvotes, hasVoted } : row)),
                );
              }}
            />
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
        <Nav
          tabs={displayedTabs}
          section={section}
          accent={accent}
          navBorderVisible={navBorderVisible}
          onSelect={(tab) => {
            setSection(tab);
            if (tab === "feedback") goFeedback("list");
          }}
        />
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
    </Theme>
    </MessagingProvider>
  );
}
