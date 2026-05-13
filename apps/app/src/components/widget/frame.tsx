"use client";

import * as React from "react";
import {
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  Flame,
  Home,
  ImageIcon,
  Map,
  Megaphone,
  MessageSquare,
  Pencil,
  X,
} from "lucide-react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Textarea } from "@featul/ui/components/textarea";

type Section = "home" | "feedback" | "roadmap" | "changelog";

type Board = {
  id: string;
  name: string;
  allowAnonymous?: boolean;
};

type IdentifiedUser = {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  signature?: string;
};

type WidgetFrameProps = {
  projectId: string;
  parentOrigin: string;
  initialTheme: "light" | "dark" | "auto";
  initialSection: Section;
};

export default function WidgetFrame({
  projectId,
  parentOrigin,
  initialTheme,
  initialSection,
}: WidgetFrameProps) {
  const [section, setSection] = React.useState<Section>(initialSection || "home");
  const [workspaceName, setWorkspaceName] = React.useState("Feedback");
  const [primaryColor, setPrimaryColor] = React.useState("#111827");
  const [tabs, setTabs] = React.useState<Section[]>(["home", "feedback", "roadmap", "changelog"]);
  const [boardId, setBoardId] = React.useState("");
  const [content, setContent] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [identity, setIdentity] = React.useState<IdentifiedUser | null>(null);
  const [roadmap, setRoadmap] = React.useState<Array<{ id: string; title: string; roadmapStatus: string | null; upvotes: number | null }>>([]);
  const [changelog, setChangelog] = React.useState<Array<{ id: string; title: string; summary: string | null; publishedAt: string | null }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const apiBase = React.useMemo(() => ({ projectId, parentOrigin }), [projectId, parentOrigin]);

  React.useEffect(() => {
    if (initialTheme === "dark") document.documentElement.classList.add("dark");
    if (initialTheme === "light") document.documentElement.classList.remove("dark");
  }, [initialTheme]);

  React.useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await client.widget.config.$get(apiBase);
        const data = await res.json();
        if (canceled) return;
        setWorkspaceName(data.workspace?.name || "Feedback");
        setPrimaryColor(data.workspace?.primaryColor || "#111827");
        const enabledTabs: Section[] = data.config?.enabledTabs?.length
          ? (data.config.enabledTabs as Section[])
          : ["feedback", "roadmap", "changelog"];
        setTabs(["home", ...enabledTabs]);
        const nextBoards: Board[] = Array.isArray(data.boards) ? data.boards : [];
        setBoardId(data.config?.defaultBoardId || nextBoards[0]?.id || "");
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
  }, [apiBase]);

  React.useEffect(() => {
    async function loadLists() {
      try {
        if (section === "home" || section === "roadmap") {
          const res = await client.widget.roadmap.$get(apiBase);
          const data = await res.json();
          setRoadmap(Array.isArray(data.posts) ? data.posts : []);
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
  }, [apiBase, section]);

  React.useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (event.data?.source !== "featul-widget") return;
      if (event.data.type === "show" && event.data.payload?.section) {
        setSection(event.data.payload.section);
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedContent = content.trim();
    const derivedTitle = normalizedContent.split(/\s+/).slice(0, 10).join(" ");
    if (!boardId || normalizedContent.length < 3) return;
    setSubmitting(true);
    setMessage("");
    try {
      const res = await client.widget.create.$post({
        ...apiBase,
        boardId,
        title: derivedTitle.slice(0, 120),
        content: normalizedContent,
        userId: userId || undefined,
        identity: identity?.email ? { ...identity, email: identity.email } : undefined,
      });
      if (!res.ok) throw new Error("Failed");
      setContent("");
      setMessage("Feedback submitted. Thank you.");
    } catch {
      setMessage(identity && !userId ? "Identification failed. Check the email passed to identify()." : "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const featuredEntry = changelog[0];
  const previewRoadmap = roadmap.slice(0, 4);
  const displayedTabs = tabs.filter((tab, index, list) => list.indexOf(tab) === index);
  const isFeedback = section === "feedback";

  return (
    <main className="flex h-screen flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[#171717] text-white shadow-sm">
      {isFeedback ? (
        <header className="flex items-center gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => setSection("home")}
            className="flex size-7 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Back to widget home"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="flex-1 text-base font-semibold">Give feedback</p>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>
          <button
            type="button"
            onClick={close}
            className="flex size-7 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close widget"
          >
            <X className="size-4" />
          </button>
        </header>
      ) : (
        <header className="flex items-center gap-3 px-4 py-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/8">
            <MessageSquare className="size-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{workspaceName}</p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setSection("feedback")}
            className="h-8 rounded-full bg-white px-3 text-xs text-black hover:bg-white/90"
          >
            <Pencil className="size-3.5" />
            Give feedback
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" className="text-white/55 hover:bg-white/10 hover:text-white" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <button type="button" onClick={close} className="text-white/45 transition-colors hover:text-white" aria-label="Close widget">
            <X className="size-4" />
          </button>
        </header>
      )}

      <div className={isFeedback ? "flex min-h-0 flex-1 flex-col px-5 pb-5 pt-1" : "min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-2"}>
        {loading ? <p className="text-sm text-white/45">Loading...</p> : null}
        {message ? <p className="mb-3 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/85">{message}</p> : null}

        {section === "home" ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => featuredEntry ? setSection("changelog") : setSection("feedback")}
              className="group relative w-full overflow-hidden rounded-2xl border border-white/8 bg-[#242424] p-5 text-left shadow-inner"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-35"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.22) 1px, transparent 0)",
                  backgroundSize: "14px 14px",
                }}
              />
              <div className="relative flex min-h-36 flex-col justify-end">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-600" />
                    <div>
                      <p className="text-sm font-semibold">{workspaceName}</p>
                      <p className="text-xs text-white/45">Product team</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#303030] px-2.5 py-2 text-center shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-[#ff7144]">New</p>
                    <p className="text-lg font-semibold leading-none">{new Date().getDate()}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#ff7144]">Built from feedback</p>
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
                  <Flame className="size-3.5 text-[#ff7144]" />
                  <p className="text-xs font-bold uppercase tracking-wide text-white/80">What's coming</p>
                </div>
                <button type="button" onClick={() => setSection("roadmap")} className="text-xs text-white/50 hover:text-white">
                  Roadmap →
                </button>
              </div>
              <div className="space-y-0">
                {previewRoadmap.length ? (
                  previewRoadmap.map((item) => (
                    <RoadmapRow key={item.id} item={item} />
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">No public roadmap items yet.</p>
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={() => setSection("feedback")}
              className="w-full rounded-2xl border border-white/8 bg-[#202020] px-5 py-4 text-left transition-colors hover:bg-[#242424]"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[#ff7144]">Share</p>
              <p className="mt-2 text-base font-semibold">Got a different idea?</p>
            </button>
          </div>
        ) : null}

        {section === "feedback" ? (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <Textarea
              variant="plain"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What's on your mind?"
              autoFocus
              className="min-h-0 flex-1 resize-none px-0 py-5 text-lg leading-relaxed text-white shadow-none placeholder:text-white/25 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-5 text-white/50">
                <button
                  type="button"
                  className="transition-colors hover:text-white"
                  aria-label="Attach image"
                >
                  <ImageIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="transition-colors hover:text-white"
                  aria-label="Take screenshot"
                >
                  <Camera className="size-4" />
                </button>
              </div>
              <Button
                type="submit"
                variant="plain"
                disabled={submitting || !boardId || content.trim().length < 3}
                className="h-10 rounded-full bg-white/60 px-5 text-sm font-medium text-black hover:bg-white/75 disabled:bg-white/20 disabled:text-white/35"
                style={!submitting && boardId && content.trim().length >= 3 ? { backgroundColor: primaryColor || "#ff7144", color: "#fff" } : undefined}
              >
                Post
              </Button>
            </div>
          </form>
        ) : null}

        {section === "roadmap" ? (
          <section className="space-y-0">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#ff7144]">Roadmap</p>
              <h2 className="mt-2 text-xl font-semibold">What’s coming next</h2>
            </div>
            {roadmap.length ? roadmap.map((item) => (
              <RoadmapRow key={item.id} item={item} />
            )) : <p className="text-sm text-white/45">No public roadmap items yet.</p>}
          </section>
        ) : null}

        {section === "changelog" ? (
          <section className="space-y-2">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#ff7144]">Updates</p>
              <h2 className="mt-2 text-xl font-semibold">Latest changes</h2>
            </div>
            {changelog.length ? changelog.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                <p className="text-sm font-medium">{entry.title}</p>
                {entry.summary ? <p className="mt-1 line-clamp-3 text-xs text-white/45">{entry.summary}</p> : null}
              </div>
            )) : <p className="text-sm text-white/45">No updates published yet.</p>}
          </section>
        ) : null}
      </div>

      {!isFeedback ? (
        <nav className="grid grid-cols-4 border-t border-white/8 bg-[#1b1b1b]/95 px-3 py-2">
          {displayedTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSection(tab)}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] transition-colors ${section === tab ? "text-[#ff7144]" : "text-white/45 hover:text-white/75"}`}
            >
              {tab === "home" ? <Home className="size-4" /> : null}
              {tab === "feedback" ? <MessageSquare className="size-4" /> : null}
              {tab === "roadmap" ? <Map className="size-4" /> : null}
              {tab === "changelog" ? <Megaphone className="size-4" /> : null}
              <span>{tab === "changelog" ? "Updates" : `${tab.charAt(0).toUpperCase()}${tab.slice(1)}`}</span>
            </button>
          ))}
        </nav>
      ) : null}
    </main>
  );
}

function RoadmapRow({
  item,
}: {
  item: { id: string; title: string; roadmapStatus: string | null; upvotes: number | null };
}) {
  return (
    <div className="flex items-center gap-3 border-b border-dashed border-white/10 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/45">
        {item.title.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="mt-1 text-xs capitalize text-white/45">
          <span className="mr-1 inline-block size-1.5 rounded-full bg-purple-500" />
          {(item.roadmapStatus || "planned").replace("-", " ")} · {item.upvotes || 0} votes
        </p>
      </div>
      <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/70">⌃ {item.upvotes || 0}</span>
    </div>
  );
}
