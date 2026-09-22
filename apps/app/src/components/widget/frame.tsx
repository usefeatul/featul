"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { client } from "@featul/api/client";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { normalizeRoadmapStatus } from "@/lib/roadmap";
import { WidgetFeedbackCompose } from "./compose";
import { WidgetFeedbackDetail } from "./detail";
import { Header } from "./header";
import { Home } from "./home";
import { WidgetEmpty } from "./empty";
import { widgetCardInnerClass, widgetCardShellClass } from "./chrome";
import { cn } from "@featul/ui/lib/utils";
import {
  mapChangelogEntries,
  parseBoards,
  parseBrandingTheme,
  parseConfigTabs,
  parseIdentifiedUser,
  parseLayoutStyle,
  parseSection,
  parseThemeMode,
  parseWidgetPosts,
  parseWidgetRoadmapItems,
} from "./load";
import { WidgetFeedbackList } from "./list";
import { MessagingProvider, postToParent, readHostMessage } from "./messaging";
import { Nav } from "./nav";
import { WidgetRoadmap, type WidgetRoadmapItem } from "./roadmap";
import {
  WidgetFeedbackListSkeleton,
  WidgetHomeSkeleton,
  WidgetNavSkeleton,
  WidgetRoadmapSkeleton,
  WidgetUpdatesSkeleton,
} from "./skeleton";
import {
  Theme,
  resolveWidgetAccent,
  resolveWidgetTheme,
  widgetAccentVars,
  widgetLayoutClass,
  widgetShellHex,
  widgetSurfaceHex,
  widgetThemeVars,
} from "./theme";
import type {
  Board,
  FeedbackView,
  IdentifiedUser,
  Section,
  WidgetBootstrap,
  WidgetLayoutStyle,
  WidgetPost,
  WidgetWorkspace,
} from "./types";
import { WidgetUpdates, type WidgetChangelogEntry } from "./updates";
import { readIdentifiedUserId, readScreenshotPayload, viewerPayload } from "./utils";

type WidgetFrameProps = {
  projectId: string;
  parentOrigin: string;
  initialTheme: "light" | "dark" | "auto";
  initialSection: Section;
  initialPosition: "left" | "right";
  initialFullscreen?: boolean;
  initialConfig?: WidgetBootstrap | null;
};

/** Normalize bootstrap config into workspace, tabs, boards, and theme. */
function readBootstrap(
  data: WidgetBootstrap,
  projectId: string,
): {
  workspace: WidgetWorkspace;
  tabs: Section[];
  layoutStyle: WidgetLayoutStyle;
  theme: WidgetWorkspace["theme"];
  boards: Board[];
} {
  const theme = parseBrandingTheme(data.config?.theme);
  const layoutStyle = parseLayoutStyle(data.config?.layoutStyle);
  const enabledTabs = parseConfigTabs(data.config?.enabledTabs);
  return {
    theme,
    layoutStyle,
    tabs: ["home", ...enabledTabs],
    boards: parseBoards(data.boards),
    workspace: {
      id: data.workspace?.id || projectId,
      name: data.workspace?.name || "Feedback",
      slug: data.workspace?.slug || "",
      logo: data.workspace?.logo || null,
      primaryColor: data.workspace?.primaryColor || null,
      hideBranding: data.workspace?.hideBranding ?? null,
      layoutStyle,
      theme,
    },
  };
}

export default function WidgetFrame({
  projectId,
  parentOrigin,
  initialTheme,
  initialSection,
  initialFullscreen = false,
  initialConfig = null,
}: WidgetFrameProps) {
  const hasBootstrap = Boolean(initialConfig);
  const bootstrap = hasBootstrap && initialConfig
    ? readBootstrap(initialConfig, projectId)
    : null;
  const [section, setSection] = React.useState<Section>(() => {
    const requested = initialSection || "home";
    if (bootstrap?.tabs.includes(requested)) return requested;
    return bootstrap?.tabs[0] || "home";
  });
  const [feedbackView, setFeedbackView] = React.useState<FeedbackView>("list");
  const [workspace, setWorkspace] = React.useState<WidgetWorkspace | null>(
    bootstrap?.workspace ?? null,
  );
  const [tabs, setTabs] = React.useState<Section[]>(bootstrap?.tabs ?? []);
  const [tabsReady, setTabsReady] = React.useState(Boolean(bootstrap));
  const [layoutStyle, setLayoutStyle] = React.useState<WidgetLayoutStyle>(
    bootstrap?.layoutStyle ?? "comfortable",
  );
  const brandingThemeRef = React.useRef<"light" | "dark" | "auto">(
    bootstrap?.theme ?? "auto",
  );
  const tabsRef = React.useRef<Section[]>(bootstrap?.tabs ?? []);
  const [boards, setBoards] = React.useState<Board[]>(bootstrap?.boards ?? []);
  const [listBoardId, setListBoardId] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [identity, setIdentity] = React.useState<IdentifiedUser | null>(null);
  const identifyVersionRef = React.useRef(0);
  const [roadmap, setRoadmap] = React.useState<WidgetRoadmapItem[]>([]);
  const [changelog, setChangelog] = React.useState<WidgetChangelogEntry[]>([]);
  const [roadmapReady, setRoadmapReady] = React.useState(false);
  const [changelogReady, setChangelogReady] = React.useState(false);
  const [recentPosts, setRecentPosts] = React.useState<WidgetPost[]>([]);
  const [recentReady, setRecentReady] = React.useState(false);
  const [selectedChangelogId, setSelectedChangelogId] = React.useState<
    string | null
  >(null);
  const [loading, setLoading] = React.useState(!bootstrap);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<WidgetPost | null>(
    null,
  );
  const [detailReturn, setDetailReturn] = React.useState<Section | null>(null);
  const [listRefreshKey, setListRefreshKey] = React.useState(0);
  const [listVotePatch, setListVotePatch] = React.useState<{
    postId: string;
    upvotes: number;
    hasVoted: boolean;
  } | null>(null);
  const [navBorderVisible, setNavBorderVisible] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(initialFullscreen);
  const [screenshotUrl, setScreenshotUrl] = React.useState<string | null>(null);
  const [capturingScreenshot, setCapturingScreenshot] = React.useState(false);
  const [captureHint, setCaptureHint] = React.useState("");
  const [themeMode, setThemeMode] = React.useState<"light" | "dark" | "auto">(
    initialTheme === "auto" && bootstrap?.theme ? bootstrap.theme : initialTheme,
  );
  const [theme, setTheme] = React.useState<"light" | "dark">(() =>
    resolveWidgetTheme(
      initialTheme === "auto" && bootstrap?.theme ? bootstrap.theme : initialTheme,
    ),
  );
  const navBorderTimeoutRef = React.useRef<number | null>(null);

  const apiBase = React.useMemo(
    () => ({ projectId, parentOrigin }),
    [projectId, parentOrigin],
  );
  const accent = resolveWidgetAccent(workspace?.primaryColor);
  const workspaceName = workspace?.name || "Feedback";
  const workspaceSlug = workspace?.slug || "";
  const workspaceLogo = workspace?.logo || null;

  React.useEffect(() => {
    if (!capturingScreenshot) return;
    const timer = window.setTimeout(() => {
      setCapturingScreenshot(false);
      setCaptureHint("Couldn’t capture this page.");
    }, 120000);
    return () => window.clearTimeout(timer);
  }, [capturingScreenshot]);

  React.useEffect(() => {
    const applyTheme = (next: "light" | "dark") => {
      setTheme(next);
      document.documentElement.style.colorScheme = next;
      document.body.style.background = widgetShellHex(next);
    };

    applyTheme(resolveWidgetTheme(themeMode));
    if (themeMode !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(resolveWidgetTheme("auto"));
    if (typeof media.addEventListener === "function")
      media.addEventListener("change", onChange);
    else media.addListener(onChange);
    return () => {
      if (typeof media.removeEventListener === "function")
        media.removeEventListener("change", onChange);
      else media.removeListener(onChange);
    };
  }, [themeMode]);

  React.useEffect(() => {
    if (!workspace) return;
    postToParent(parentOrigin, "brand", {
      primaryColor: accent,
      name: workspace.name,
    });
  }, [accent, parentOrigin, workspace]);

  React.useEffect(() => {
    if (hasBootstrap) postToParent(parentOrigin, "ready");
  }, [hasBootstrap, parentOrigin]);

  React.useEffect(() => {
    let canceled = false;
    async function load() {
      if (!hasBootstrap) {
        setLoading(true);
        setLoadFailed(false);
      }
      try {
        const res = await client.widget.config.$get(apiBase);
        const data = await res.json();
        if (canceled) return;
        const next = readBootstrap(data, projectId);
        brandingThemeRef.current = next.theme;
        tabsRef.current = next.tabs;
        setWorkspace(next.workspace);
        setLayoutStyle(next.layoutStyle);
        setTabs(next.tabs);
        setSection((current) =>
          next.tabs.includes(current) ? current : "home",
        );
        if (initialTheme === "auto") setThemeMode(next.theme);
        setBoards(next.boards);
        setListBoardId("");
        setTabsReady(true);
        postToParent(parentOrigin, "ready");
      } catch {
        if (!canceled && !hasBootstrap) setLoadFailed(true);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => {
      canceled = true;
    };
  }, [apiBase, parentOrigin, projectId, initialTheme, hasBootstrap]);

  React.useEffect(() => {
    let canceled = false;

    async function loadLists() {
      if (loading || loadFailed || !workspace) {
        if (!loading && !workspace) {
          setRoadmapReady(true);
          setChangelogReady(true);
          setRecentReady(true);
        }
        return;
      }

      const showRoadmap = tabs.includes("roadmap");
      const showChangelog = tabs.includes("changelog");
      const showRecent = !showRoadmap && !showChangelog;
      if (!showRoadmap) {
        setRoadmap([]);
        setRoadmapReady(true);
      }
      if (!showChangelog) {
        setChangelog([]);
        setChangelogReady(true);
      }
      if (!showRecent) {
        setRecentPosts([]);
        setRecentReady(true);
      }

      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      const identityPayload = identity?.email
        ? {
            id: identity.id,
            email: identity.email,
            name: identity.name,
            avatar: identity.avatar,
            expiresAt: identity.expiresAt,
            signature: identity.signature,
          }
        : undefined;

      await Promise.all([
        showRoadmap
          ? (async () => {
              try {
                const res = await client.widget.roadmap.$get({
                  ...apiBase,
                  identity: identityPayload,
                  fingerprint,
                });
                const data = await res.json();
                if (canceled) return;
                setRoadmap(parseWidgetRoadmapItems(data.posts));
                setRoadmapReady(true);
              } catch {
                if (!canceled) setRoadmapReady(true);
              }
            })()
          : Promise.resolve(),
        showChangelog
          ? (async () => {
              try {
                const res = await client.widget.changelog.$get(apiBase);
                const data = await res.json();
                if (canceled) return;
                const entries = Array.isArray(data.entries) ? data.entries : [];
                setChangelog(mapChangelogEntries(entries));
                setChangelogReady(true);
              } catch {
                if (!canceled) setChangelogReady(true);
              }
            })()
          : Promise.resolve(),
        showRecent
          ? (async () => {
              try {
                const res = await client.widget.posts.$get({
                  ...viewerPayload(apiBase, {
                    userId,
                    identity,
                    fingerprint,
                  }),
                  sort: "newest",
                  limit: 6,
                  offset: 0,
                });
                const data = await res.json();
                if (canceled) return;
                setRecentPosts(parseWidgetPosts(data.posts));
                setRecentReady(true);
              } catch {
                if (!canceled) {
                  setRecentPosts([]);
                  setRecentReady(true);
                }
              }
            })()
          : Promise.resolve(),
      ]);
    }

    loadLists();
    return () => {
      canceled = true;
    };
  }, [
    apiBase,
    identity,
    userId,
    tabs,
    loading,
    loadFailed,
    workspace,
    listRefreshKey,
  ]);

  React.useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      const message = readHostMessage(event, parentOrigin);
      if (!message) return;
      if (message.type === "layout") {
        const payload = message.payload;
        if (payload && typeof payload === "object" && "fullscreen" in payload) {
          setFullscreen(
            Boolean((payload as { fullscreen?: unknown }).fullscreen),
          );
        }
        return;
      }
      if (message.type === "theme") {
        const mode = parseThemeMode(message.payload);
        if (mode) setThemeMode(mode === "auto" ? brandingThemeRef.current : mode);
        return;
      }
      if (message.type === "show") {
        const nextSection = parseSection(message.payload);
        const allowed = nextSection && tabsRef.current.includes(nextSection)
          ? nextSection
          : nextSection
            ? "home"
            : null;
        if (allowed) {
          setSection(allowed);
          if (allowed === "feedback") {
            setFeedbackView("list");
            setSelectedPost(null);
          }
        }
      }
      if (message.type === "screenshot") {
        setCapturingScreenshot(false);
        const shot = readScreenshotPayload(message.payload);
        if (shot.dataUrl) {
          setCaptureHint("");
          postToParent(parentOrigin, "panel", {
            expanded: false,
            overlay: true,
          });
          setScreenshotUrl(shot.dataUrl);
        } else {
          setCaptureHint(
            shot.error === "cancelled"
              ? "Screenshot was cancelled."
              : "Couldn’t capture this page.",
          );
        }
        return;
      }
      if (message.type === "identify") {
        const requestVersion = ++identifyVersionRef.current;
        const nextIdentity = parseIdentifiedUser(message.payload);
        if (!nextIdentity) {
          setIdentity(null);
          setUserId(null);
          return;
        }
        try {
          const res = await client.widget.identify.$post({
            ...apiBase,
            user: nextIdentity,
          });
          const data = await res.json();
          if (requestVersion !== identifyVersionRef.current) return;
          const identifiedUserId = readIdentifiedUserId(data);
          setIdentity(identifiedUserId ? nextIdentity : null);
          setUserId(identifiedUserId);
        } catch {
          if (requestVersion !== identifyVersionRef.current) return;
          setIdentity(null);
          setUserId(null);
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [apiBase, parentOrigin]);

  React.useEffect(() => {
    if (!identity) return;
    const expiresInMs = identity.expiresAt * 1000 - Date.now();
    if (expiresInMs <= 0) {
      setIdentity(null);
      setUserId(null);
      return;
    }
    const timeout = window.setTimeout(() => {
      identifyVersionRef.current += 1;
      setIdentity(null);
      setUserId(null);
    }, expiresInMs);
    return () => window.clearTimeout(timeout);
  }, [identity]);

  const reduceMotion = useReducedMotion();

  const close = () => {
    postToParent(parentOrigin, "close");
  };

  const goFeedback = (view: FeedbackView = "list") => {
    setSection("feedback");
    setFeedbackView(view);
    if (view !== "detail") setSelectedPost(null);
    if (view !== "compose") {
      setScreenshotUrl(null);
      setCapturingScreenshot(false);
    }
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
      (item) =>
        normalizeRoadmapStatus(item.roadmapStatus, "planned") === "progress",
    );
    const rest = roadmap.filter(
      (item) =>
        normalizeRoadmapStatus(item.roadmapStatus, "planned") !== "progress",
    );
    return [...progress, ...rest].slice(0, 5);
  }, [roadmap]);
  const homeChangelog = changelog.slice(0, 5);
  const homeRoadmapLabel = homeRoadmap.some(
    (item) =>
      normalizeRoadmapStatus(item.roadmapStatus, "planned") === "progress",
  )
    ? "In progress"
    : "Roadmap";
  const displayedTabs = tabs.filter(
    (tab, index, list) => list.indexOf(tab) === index,
  );
  const isFeedback = section === "feedback";
  const isChangelogDetail =
    section === "changelog" && Boolean(selectedChangelogId);
  const showNavSlot =
    !loadFailed &&
    !screenshotUrl &&
    (!isFeedback || feedbackView === "list") &&
    !isChangelogDetail;
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
    postToParent(parentOrigin, "panel", {
      expanded: isChangelogDetail,
      overlay: Boolean(screenshotUrl),
    });
  }, [isChangelogDetail, parentOrigin, screenshotUrl]);

  const prevSectionRef = React.useRef(section);
  React.useEffect(() => {
    const prev = prevSectionRef.current;
    prevSectionRef.current = section;
    if (prev === "changelog" && section !== "changelog") {
      setSelectedChangelogId(null);
    }
  }, [section]);

  React.useEffect(() => {
    if (!listVotePatch) return;
    setRecentPosts((prev) =>
      prev.map((post) =>
        post.id === listVotePatch.postId
          ? {
              ...post,
              upvotes: listVotePatch.upvotes,
              hasVoted: listVotePatch.hasVoted,
            }
          : post,
      ),
    );
  }, [listVotePatch]);

  return (
    <MessagingProvider parentOrigin={parentOrigin}>
      <Theme mode={themeMode}>
        <motion.main
          initial={false}
          className={cn(
            widgetLayoutClass(layoutStyle),
            screenshotUrl
              ? "flex h-full min-h-0 w-full flex-col overflow-hidden bg-[rgb(var(--widget-surface))] text-[rgb(var(--widget-fg))]"
              : cn(widgetCardShellClass, "h-full min-h-0 w-full"),
            fullscreen ? "rounded-none border-0" : "",
          )}
          style={
            {
              backgroundColor: screenshotUrl
                ? widgetSurfaceHex(theme)
                : widgetShellHex(theme),
              color: theme === "light" ? "#171717" : "#fafafa",
              paddingTop: fullscreen
                ? "max(0.25rem, env(safe-area-inset-top, 0px))"
                : undefined,
              paddingBottom: fullscreen
                ? "max(0.25rem, env(safe-area-inset-bottom, 0px))"
                : undefined,
              paddingLeft: fullscreen
                ? "max(0.25rem, env(safe-area-inset-left, 0px))"
                : undefined,
              paddingRight: fullscreen
                ? "max(0.25rem, env(safe-area-inset-right, 0px))"
                : undefined,
              ...widgetThemeVars(theme),
              ...widgetAccentVars(accent),
            } as React.CSSProperties
          }
        >
          <div
            className={
              screenshotUrl
                ? "flex min-h-0 flex-1 flex-col"
                : cn(widgetCardInnerClass, "flex min-h-0 flex-1 flex-col overflow-hidden")
            }
          >
          {!screenshotUrl ? (
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
              if (detailReturn) {
                const next = detailReturn;
                setDetailReturn(null);
                setSelectedPost(null);
                setFeedbackView("list");
                setSection(next);
                return;
              }
              goFeedback("list");
            }}
            onCompose={() => goFeedback("compose")}
            onClose={close}
            fullscreen={fullscreen}
            loading={loading}
            hideCompose={loadFailed}
            layoutStyle={layoutStyle}
          />
          ) : null}

          <div
            className={
              isFeedback && screenshotUrl
                ? "relative flex min-h-0 flex-1 flex-col"
                : isFeedback &&
              (feedbackView === "list" || feedbackView === "detail")
                ? "relative flex min-h-0 flex-1 flex-col"
                : isChangelogDetail || section === "changelog"
                  ? "relative flex min-h-0 flex-1 flex-col overflow-hidden"
                  : isFeedback
                    ? "relative flex min-h-0 flex-1 flex-col px-5 pb-4"
                    : section === "roadmap"
                      ? "relative flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide pb-5 pt-0"
                      : section === "home"
                        ? `relative flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide ${
                            layoutStyle === "compact"
                              ? "pb-3 pt-2"
                              : layoutStyle === "spacious"
                                ? "pb-7 pt-5"
                                : "pb-5 pt-4"
                          }`
                        : "relative flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide px-5 pb-5 pt-3"
            }
            data-widget-scroll=""
          >
            {loading ? (
              <motion.div key="loading" initial={false} className="flex min-h-0 flex-1 flex-col">
                {section === "feedback" ? (
                  <WidgetFeedbackListSkeleton withToolbar />
                ) : section === "roadmap" ? (
                  <WidgetRoadmapSkeleton />
                ) : section === "changelog" ? (
                  <WidgetUpdatesSkeleton />
                ) : (
                  <WidgetHomeSkeleton
                    featured={false}
                    roadmap={false}
                    updates={false}
                    recent
                  />
                )}
              </motion.div>
            ) : null}

            {!loading && loadFailed ? (
              <WidgetEmpty
                title="Couldn’t load right now"
                description="Check your connection and open the widget again."
              />
            ) : null}

            {!loading && !loadFailed ? (
              <>
                <div className={section === "home" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
                  <Home
                    featuredEntry={featuredEntry}
                    homeRoadmap={homeRoadmap}
                    homeChangelog={homeChangelog}
                    homeRoadmapLabel={homeRoadmapLabel}
                    changelogLoading={!changelogReady}
                    roadmapLoading={!roadmapReady}
                    showRoadmap={tabs.includes("roadmap")}
                    showChangelog={tabs.includes("changelog")}
                    showRecent={
                      !tabs.includes("roadmap") && !tabs.includes("changelog")
                    }
                    recentPosts={recentPosts}
                    recentLoading={!recentReady}
                    layoutStyle={layoutStyle}
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
                    onSeeFeedback={() => goFeedback("list")}
                    onCompose={() => goFeedback("compose")}
                    onOpenRoadmapItem={(post) => {
                      setDetailReturn("home");
                      setSelectedPost(post);
                      setSection("feedback");
                      setFeedbackView("detail");
                    }}
                    onVoteChange={(id, upvotes, hasVoted) => {
                      setRoadmap((prev) =>
                        prev.map((row) =>
                          row.id === id ? { ...row, upvotes, hasVoted } : row,
                        ),
                      );
                      setRecentPosts((prev) =>
                        prev.map((row) =>
                          row.id === id ? { ...row, upvotes, hasVoted } : row,
                        ),
                      );
                    }}
                  />
                </div>

                <div
                  className={
                    section === "feedback"
                      ? "relative flex min-h-0 flex-1 flex-col"
                      : "hidden"
                  }
                >
                  <div
                    className={
                      feedbackView === "list"
                        ? "flex min-h-0 flex-1 flex-col"
                        : "pointer-events-none invisible absolute inset-0 flex flex-col"
                    }
                    aria-hidden={section !== "feedback" || feedbackView !== "list"}
                  >
                    <WidgetFeedbackList
                      apiBase={apiBase}
                      boards={boards}
                      boardId={listBoardId}
                      onBoardChange={setListBoardId}
                      userId={userId}
                      identity={identity}
                      refreshKey={listRefreshKey}
                      active={section === "feedback" && feedbackView === "list"}
                      votePatch={listVotePatch}
                      onCompose={() => goFeedback("compose")}
                      onOpenPost={(post) => {
                        setDetailReturn(null);
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
                        accent={accent}
                        ink={theme === "light" ? "#171717" : "#fafafa"}
                        screenshotUrl={screenshotUrl}
                        capturing={capturingScreenshot}
                        captureHint={captureHint}
                        onCapture={() => {
                          setCaptureHint("");
                          setCapturingScreenshot(true);
                          postToParent(parentOrigin, "capture-screenshot");
                        }}
                        onScreenshotConsumed={() => {
                          setScreenshotUrl(null);
                          setCaptureHint("");
                        }}
                        onCancel={() => goFeedback("list")}
                        onCreated={(post) => {
                          setSelectedPost(post);
                          setListRefreshKey((value) => value + 1);
                        }}
                        onView={(post) => {
                          setDetailReturn(null);
                          setSelectedPost(post);
                          setFeedbackView("detail");
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
                            prev && prev.id === postId
                              ? { ...prev, upvotes, hasVoted }
                              : prev,
                          );
                          setListVotePatch({ postId, upvotes, hasVoted });
                        }}
                      />
                    </motion.div>
                  ) : null}
                </div>

                <div
                  className={
                    section === "roadmap"
                      ? "flex min-h-0 flex-1 flex-col"
                      : "hidden"
                  }
                >
                  {!roadmapReady ? (
                    <WidgetRoadmapSkeleton />
                  ) : (
                    <WidgetRoadmap
                      items={roadmap}
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
                      onOpen={(item) => {
                        setDetailReturn("roadmap");
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
                    />
                  )}
                </div>

                <div
                  className={
                    section === "changelog"
                      ? "flex min-h-0 flex-1 flex-col"
                      : "hidden"
                  }
                >
                  {!changelogReady ? (
                    <WidgetUpdatesSkeleton />
                  ) : (
                    <WidgetUpdates
                      entries={changelog}
                      accent={accent}
                      selectedId={selectedChangelogId}
                      onOpen={(entry) => setSelectedChangelogId(entry.id)}
                      onBack={() => setSelectedChangelogId(null)}
                    />
                  )}
                </div>
              </>
            ) : null}
          </div>

          {showNavSlot ? (
            tabsReady ? (
            <Nav
              tabs={displayedTabs}
              section={section}
              accent={accent}
              navBorderVisible={navBorderVisible}
              fullscreen={fullscreen}
              layoutStyle={layoutStyle}
              onSelect={(tab) => {
                setSection(tab);
                if (tab === "feedback") goFeedback("list");
              }}
            />
            ) : (
              <WidgetNavSkeleton
                fullscreen={fullscreen}
                layoutStyle={layoutStyle}
              />
            )
          ) : null}

          {!workspace?.hideBranding &&
          !screenshotUrl &&
          !(
            isFeedback &&
            (feedbackView === "compose" || feedbackView === "detail")
          ) &&
          !isChangelogDetail ? (
            <div className="border-t border-[rgb(var(--widget-fg)/0.1)] px-4 py-1 text-center">
              <a
                href="https://featul.com?utm_source=powered_by&utm_medium=referral&utm_campaign=widget"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] leading-none text-[rgb(var(--widget-fg)/0.35)] transition-colors hover:text-[rgb(var(--widget-fg)/0.6)]"
              >
                <span>Powered by featul</span>
                <FeatulLogoIcon className="size-3 shrink-0" size={12} />
              </a>
            </div>
          ) : null}
          </div>
        </motion.main>
      </Theme>
    </MessagingProvider>
  );
}
