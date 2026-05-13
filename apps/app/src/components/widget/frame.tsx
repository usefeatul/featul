"use client";

import * as React from "react";
import { MessageSquare, X } from "lucide-react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Textarea } from "@featul/ui/components/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@featul/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@featul/ui/components/select";

type Section = "feedback" | "roadmap" | "changelog";

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
  const [section, setSection] = React.useState<Section>(initialSection);
  const [workspaceName, setWorkspaceName] = React.useState("Feedback");
  const [primaryColor, setPrimaryColor] = React.useState("#111827");
  const [tabs, setTabs] = React.useState<Section[]>(["feedback", "roadmap", "changelog"]);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [boardId, setBoardId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [identity, setIdentity] = React.useState<IdentifiedUser | null>(null);
  const [similar, setSimilar] = React.useState<Array<{ id: string; title: string; upvotes: number | null }>>([]);
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
        setTabs(data.config?.enabledTabs?.length ? data.config.enabledTabs : ["feedback", "roadmap", "changelog"]);
        const nextBoards = Array.isArray(data.boards) ? data.boards : [];
        setBoards(nextBoards);
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
        if (section === "roadmap") {
          const res = await client.widget.roadmap.$get(apiBase);
          const data = await res.json();
          setRoadmap(Array.isArray(data.posts) ? data.posts : []);
        }
        if (section === "changelog") {
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
    if (title.trim().length < 2 || !boardId) {
      setSimilar([]);
      return;
    }
    const timeout = window.setTimeout(async () => {
      try {
        const res = await client.widget.similar.$get({ ...apiBase, title, boardId });
        const data = await res.json();
        setSimilar(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        setSimilar([]);
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [apiBase, boardId, title]);

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
    if (!boardId || !title.trim()) return;
    setSubmitting(true);
    setMessage("");
    try {
      const res = await client.widget.create.$post({
        ...apiBase,
        boardId,
        title,
        content: content.trim() || title,
        userId: userId || undefined,
        identity: identity?.email ? { ...identity, email: identity.email } : undefined,
      });
      if (!res.ok) throw new Error("Failed");
      setTitle("");
      setContent("");
      setSimilar([]);
      setMessage("Feedback submitted. Thank you.");
    } catch {
      setMessage(identity && !userId ? "Identification failed. Check the email passed to identify()." : "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const voteForPost = async (postId: string) => {
    try {
      const res = await client.widget.vote.$post({
        ...apiBase,
        postId,
        userId: userId || undefined,
        identity: identity?.email ? { ...identity, email: identity.email } : undefined,
      });
      const data = await res.json();
      setSimilar((items) =>
        items.map((item) =>
          item.id === postId ? { ...item, upvotes: data.upvotes || 0 } : item,
        ),
      );
    } catch {
      setMessage("Could not update vote.");
    }
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden rounded-[14px] border border-border bg-background text-foreground shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{workspaceName}</p>
          <p className="text-xs text-muted-foreground">Feedback, roadmap, and updates</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={close} aria-label="Close widget">
          <X className="size-4" />
        </Button>
      </header>

      <Tabs value={section} onValueChange={(value) => setSection(value as Section)} className="min-h-0 flex-1 gap-0">
        <TabsList className="shrink-0 px-3 pt-2">
          {tabs.includes("feedback") ? <TabsTrigger value="feedback">Feedback</TabsTrigger> : null}
          {tabs.includes("roadmap") ? <TabsTrigger value="roadmap">Roadmap</TabsTrigger> : null}
          {tabs.includes("changelog") ? <TabsTrigger value="changelog">Updates</TabsTrigger> : null}
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
          {message ? <p className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">{message}</p> : null}

          <TabsContent value="feedback" className="m-0">
            <form onSubmit={submit} className="space-y-3">
              {boards.length > 1 ? (
                <Select value={boardId} onValueChange={setBoardId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What should we improve?" />
              <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Add context, examples, or the screen where this came up." className="min-h-28" />
              <Button type="submit" disabled={submitting || !boardId || title.trim().length < 3} className="w-full" style={{ backgroundColor: primaryColor }}>
                <MessageSquare className="size-4" />
                Submit feedback
              </Button>
            </form>
            {similar.length ? (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Similar suggestions</p>
                {similar.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.upvotes || 0} votes</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => voteForPost(item.id)}>
                      Vote
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="roadmap" className="m-0 space-y-2">
            {roadmap.length ? roadmap.map((item) => (
              <div key={item.id} className="rounded-md border border-border px-3 py-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">{(item.roadmapStatus || "planned").replace("-", " ")} · {item.upvotes || 0} votes</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No public roadmap items yet.</p>}
          </TabsContent>

          <TabsContent value="changelog" className="m-0 space-y-2">
            {changelog.length ? changelog.map((entry) => (
              <div key={entry.id} className="rounded-md border border-border px-3 py-2">
                <p className="text-sm font-medium">{entry.title}</p>
                {entry.summary ? <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{entry.summary}</p> : null}
              </div>
            )) : <p className="text-sm text-muted-foreground">No updates published yet.</p>}
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
