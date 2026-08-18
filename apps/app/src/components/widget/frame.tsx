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
import {
  mapChangelogEntries,
  parseBoards,
  parseConfigTabs,
  parseIdentifiedUser,
  parseSection,
  parseThemeMode,
  parseWidgetRoadmapItems,
} from "./load";
import { WidgetFeedbackList } from "./list";
import { MessagingProvider, postToParent, readHostMessage } from "./messaging";
import { Nav } from "./nav";
import { WidgetRoadmap, type WidgetRoadmapItem } from "./roadmap";
import {
  WidgetFeedbackListSkeleton,
  WidgetHomeSkeleton,
  WidgetRoadmapSkeleton,
  WidgetUpdatesSkeleton,
} from "./skeleton";
import {
  Theme,
  resolveWidgetAccent,
  resolveWidgetTheme,
  widgetSurfaceHex,
  widgetThemeVars,
} from "./theme";
import type {
  Board,
  FeedbackView,
  IdentifiedUser,
  Section,
  WidgetPost,
  WidgetWorkspace,
} from "./types";
import { WidgetUpdates, type WidgetChangelogEntry } from "./updates";
import { readIdentifiedUserId } from "./utils";

type WidgetFrameProps = {
  projectId: string;
  parentOrigin: string;
  initialTheme: "light" | "dark" | "auto";
  initialSection: Section;
  initialPosition: "left" | "right";
  initialFullscreen?: boolean;
};

export default function WidgetFrame({
  projectId,
  parentOrigin,
  initialTheme,
  initialSection,
  initialFullscreen = false,
}: WidgetFrameProps) {
  const [section, setSection] = React.useState<Section>(
    initialSection || "home",
  );
  const [feedbackView, setFeedbackView] = React.useState<FeedbackView>("list");
  const [workspace, setWorkspace] = React.useState<WidgetWorkspace | null>(
    null,
  );
  const [tabs, setTabs] = React.useState<Section[]>([
    "home",
    "feedback",
    "roadmap",
    "changelog",
  ]);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [listBoardId, setListBoardId] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [identity, setIdentity] = React.useState<IdentifiedUser | null>(null);
  const identifyVersionRef = React.useRef(0);
  const [roadmap, setRoadmap] = React.useState<WidgetRoadmapItem[]>([]);
  const [changelog, setChangelog] = React.useState<WidgetChangelogEntry[]>([]);
  const [roadmapReady, setRoadmapReady] = React.useState(false);
  const [changelogReady, setChangelogReady] = React.useState(false);
  const [selectedChangelogId, setSelectedChangelogId] = React.useState<
    string | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<WidgetPost | null>(
    null,
  );
  const [listRefreshKey, setListRefreshKey] = React.useState(0);
  const [listVotePatch, setListVotePatch] = React.useState<{
    postId: string;
    upvotes: number;
    hasVoted: boolean;
  } | null>(null);
  const [navBorderVisible, setNavBorderVisible] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(initialFullscreen);
  const [themeMode, setThemeMode] = React.useState<"light" | "dark" | "auto">(
    initialTheme,
  );
  const [theme, setTheme] = React.useState<"light" | "dark">(() =>
    resolveWidgetTheme(initialTheme),
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
    const applyTheme = (next: "light" | "dark") => {
      setTheme(next);
      document.documentElement.style.colorScheme = next;
      document.body.style.background = widgetSurfaceHex(next);
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
    let canceled = false;
    async function load() {
      setLoading(true);
      setLoadFailed(false);
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
        const enabledTabs = parseConfigTabs(data.config?.enabledTabs);
        const fallbackTabs: Array<Exclude<Section, "home">> = [
          "feedback",
          "roadmap",
          "changelog",
        ];
        setTabs(["home", ...(enabledTabs.length ? enabledTabs : fallbackTabs)]);
        setBoards(parseBoards(data.boards));
        setListBoardId("");
        postToParent(parentOrigin, "ready");
      } catch {
        if (!canceled) setLoadFailed(true);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => {
      canceled = true;
    };
  }, [apiBase, parentOrigin, projectId]);

  React.useEffect(() => {
    let canceled = false;

    async function loadLists() {
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
        (async () => {
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
        })(),
        (async () => {
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
        })(),
      ]);
    }

    loadLists();
    return () => {
      canceled = true;
    };
  }, [apiBase, identity, userId]);

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
        if (mode) setThemeMode(mode);
        return;
      }
      if (message.type === "show") {
        const nextSection = parseSection(message.payload);
        if (nextSection) {
          setSection(nextSection);
          if (nextSection === "feedback") {
            setFeedbackView("list");
            setSelectedPost(null);
          }
        }
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
  const showTabs =
    !loadFailed &&
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
          initial={false}
          className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-[rgb(var(--widget-surface))] text-[rgb(var(--widget-fg))] ${
            fullscreen
              ? "rounded-none border-0"
              : "rounded-xl border border-[rgb(var(--widget-fg)/0.1)]"
          }`}
          style={
            {
              ["--widget-accent" as string]: accent,
              backgroundColor: widgetSurfaceHex(theme),
              color: theme === "light" ? "#171717" : "#fafafa",
              paddingTop: fullscreen
                ? "env(safe-area-inset-top, 0px)"
                : undefined,
              paddingBottom: fullscreen
                ? "env(safe-area-inset-bottom, 0px)"
                : undefined,
              paddingLeft: fullscreen
                ? "env(safe-area-inset-left, 0px)"
                : undefined,
              paddingRight: fullscreen
                ? "env(safe-area-inset-right, 0px)"
                : undefined,
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
            fullscreen={fullscreen}
            loading={loading}
            hideCompose={loadFailed}
          />

          <div
            className={
              isFeedback &&
              (feedbackView === "list" || feedbackView === "detail")
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
              <motion.div key="loading" initial={false} className="flex min-h-0 flex-1 flex-col">
                {section === "feedback" ? (
                  <WidgetFeedbackListSkeleton withToolbar />
                ) : section === "roadmap" ? (
                  <WidgetRoadmapSkeleton />
                ) : section === "changelog" ? (
                  <WidgetUpdatesSkeleton />
                ) : (
                  <WidgetHomeSkeleton />
                )}
              </motion.div>
            ) : null}

            {!loading && loadFailed ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-medium text-[rgb(var(--widget-fg))]">
                  Couldn’t load right now
                </p>
                <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
                  Check your connection and open the widget again.
                </p>
              </div>
            ) : null}

            {!loading && !loadFailed ? (
              <>
                <div className={section === "home" ? undefined : "hidden"}>
                  <Home
                    featuredEntry={featuredEntry}
                    homeRoadmap={homeRoadmap}
                    homeChangelog={homeChangelog}
                    homeRoadmapLabel={homeRoadmapLabel}
                    changelogLoading={!changelogReady}
                    roadmapLoading={!roadmapReady}
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
                        }}
                        onView={(post) => {
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

          {showTabs ? (
            <Nav
              tabs={displayedTabs}
              section={section}
              accent={accent}
              navBorderVisible={navBorderVisible}
              fullscreen={fullscreen}
              onSelect={(tab) => {
                setSection(tab);
                if (tab === "feedback") goFeedback("list");
              }}
            />
          ) : null}

          {!workspace?.hideBranding &&
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
