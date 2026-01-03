# Objectives
- Create a dedicated monorepo for the CDN‑served Featul Widget SDK with clean, type‑safe code.
- Implement the initial global API: init, open, close, toggle, identify.
- Provide a minimal React UI with three tabs and typed API clients, matching the spec in [widget.md](file:///Users/dalyjean/Desktop/featul/plan/widget.md).

## Monorepo Setup
- Tooling: Bun workspace + Turbo for pipelines, tsup for bundling, eslint + prettier.
- Structure:
  - apps/
    - widget-cdn: Edge app to serve /widget/v1/featul.js and static assets.
    - widget-demo: HTML demo to verify the snippet and API.
  - packages/
    - widget-sdk: TypeScript React SDK bundled to a single ESM module.
- Package manager: Bun (aligns with root). Workspaces follow Turbo conventions.

## Build & Release
- Bundles: ESM `featul.js` with sourcemap, minified, no external peer deps at runtime.
- Aliases: react/react-dom → preact/compat for smaller bundle, optional toggle.
- Public path versioning: /widget/v1/featul.js, future v2 via semver.
- CDN server:
  - widget-cdn serves built artifacts with long cache and immutable filenames.
  - Adds `Cache-Control: public, max-age=31536000, immutable` and `ETag`.
- CI steps:
  - Build SDK → upload to CDN app → promote after smoke test on widget-demo.

## SDK Package Layout (packages/widget-sdk)
- src/bootstrap.ts: Drain `$ftq` queue and attach real SDK to `window.featul`.
- src/types.ts: Interfaces and zod schemas for config, posts, changelog.
- src/store.ts: Zustand store for open/close/tab/theme and user.
- src/api/client.ts: Typed fetch client with baseUrl and guards.
- src/api/queries.ts: React Query hooks for config/roadmap/changelog.
- src/widget-root.tsx: Floating button + panel + tab bar.
- src/tabs/feedback-tab.tsx: Submit form + similar posts.
- src/tabs/roadmap-tab.tsx: Planned items list.
- src/tabs/changelog-tab.tsx: Changelog entries list.
- src/index.ts: Entry that mounts, exposes global methods, and processes queue.

## Initial Global API (typesafe)
```ts
export type FeatulWidgetTab = "feedback" | "roadmap" | "changelog";

export interface FeatulInitOptions {
  widget?: boolean;
  theme?: "light" | "dark" | "auto";
  defaultTab?: FeatulWidgetTab;
  user?: { id: string; email?: string; name?: string; avatarUrl?: string };
  baseUrl?: string;
}

export interface FeatulGlobal {
  init: (projectKey: string, options?: FeatulInitOptions) => void;
  open: (tab?: FeatulWidgetTab) => void;
  close: () => void;
  toggle: () => void;
  identify: (user: NonNullable<FeatulInitOptions["user"]>) => void;
}
```

## Store
```ts
import { create } from "zustand";
import type { FeatulInitOptions, FeatulWidgetTab } from "./types";

interface WidgetState {
  isOpen: boolean;
  currentTab: FeatulWidgetTab;
  theme: NonNullable<FeatulInitOptions["theme"]>;
  options?: FeatulInitOptions;
  user?: NonNullable<FeatulInitOptions["user"]>;
  open: (tab?: FeatulWidgetTab) => void;
  close: () => void;
  toggle: () => void;
  setOptions: (o: FeatulInitOptions) => void;
  setUser: (u: NonNullable<FeatulInitOptions["user"]>) => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  isOpen: false,
  currentTab: "feedback",
  theme: "auto",
  open: (tab) => set((s) => ({ isOpen: true, currentTab: tab ?? s.currentTab })),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOptions: (options) => set({ options, theme: options.theme ?? "auto" }),
  setUser: (user) => set({ user }),
}));
```

## Typed Fetch Client
```ts
import { z } from "zod";

export const ConfigSchema = z.object({
  workspaceId: z.string(),
  workspaceSlug: z.string(),
  name: z.string(),
  logo: z.string().url().optional(),
  branding: z.object({
    primary: z.string(),
    theme: z.enum(["light", "dark"]),
    layoutStyle: z.string(),
    sidebarPosition: z.enum(["left", "right"]),
    hidePoweredBy: z.boolean(),
  }),
  visibility: z.object({ roadmap: z.boolean(), changelog: z.boolean() }),
  feedback: z.object({ defaultBoardSlug: z.string() }),
});

export type Config = z.infer<typeof ConfigSchema>;

function toUrl(base: string | undefined, path: string, q?: Record<string, string>) {
  const u = new URL(path, base ?? document.location.origin);
  if (q) Object.entries(q).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
}

export async function getConfig(baseUrl: string | undefined, projectKey: string) {
  const u = toUrl(baseUrl, "/api/widget/config", { projectKey });
  const res = await fetch(u, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error("config_failed");
  const json = await res.json();
  return ConfigSchema.parse(json);
}
```

## Bootstrap & Global
```ts
import type { FeatulGlobal, FeatulInitOptions, FeatulWidgetTab } from "./types";
import { useWidgetStore } from "./store";
import { mountWidget } from "./widget-root";
import { getConfig } from "./api/client";

declare global { interface Window { $ftq?: any[]; featul?: any } }

function init(projectKey: string, options?: FeatulInitOptions) {
  const store = useWidgetStore.getState();
  store.setOptions(options ?? {});
  mountWidget();
  getConfig(options?.baseUrl, projectKey).then((cfg) => {
    useWidgetStore.setState((s) => ({ options: { ...s.options, defaultTab: s.options?.defaultTab ?? "feedback" } }));
    if (options?.widget) useWidgetStore.getState().open(options.defaultTab);
  }).catch(() => {});
}

function open(tab?: FeatulWidgetTab) { useWidgetStore.getState().open(tab); }
function close() { useWidgetStore.getState().close(); }
function toggle() { useWidgetStore.getState().toggle(); }
function identify(user: NonNullable<FeatulInitOptions["user"]>) { useWidgetStore.getState().setUser(user); }

const sdk: FeatulGlobal = { init, open, close, toggle, identify };

function drainQueue() {
  const q = Array.isArray(window.$ftq) ? window.$ftq : [];
  window.$ftq = [];
  q.forEach(([m, ...args]) => { const fn = (sdk as any)[m]; if (typeof fn === "function") fn(...args); });
}

export function attachGlobal() {
  window.featul = sdk;
  drainQueue();
}

attachGlobal();
```

## Widget Root (mount)
```ts
import React from "react";
import { createRoot } from "react-dom/client";
import { useWidgetStore } from "./store";

function WidgetRoot() {
  const { isOpen, currentTab } = useWidgetStore();
  return (
    <div id="ft-widget">
      <button onClick={() => useWidgetStore.getState().toggle()}>Featul</button>
      {isOpen && (
        <div>
          <div>
            <button onClick={() => useWidgetStore.getState().open("feedback")}>Feedback</button>
            <button onClick={() => useWidgetStore.getState().open("roadmap")}>Roadmap</button>
            <button onClick={() => useWidgetStore.getState().open("changelog")}>Changelog</button>
          </div>
          <div>{currentTab}</div>
        </div>
      )}
    </div>
  );
}

let root: ReturnType<typeof createRoot> | undefined;

export function mountWidget() {
  const id = "featul-widget-root";
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("div"); el.id = id; document.body.appendChild(el); }
  if (!root) root = createRoot(el);
  root.render(React.createElement(WidgetRoot));
}
```

## API Endpoints Integration
- Implement public endpoints in the existing app or add a thin proxy:
  - GET /api/widget/config → resolves `projectKey` to workspace config.
  - GET /api/post/getSimilar → similar posts during feedback typing.
  - POST /api/post/create → create feedback and auto‑upvote.
  - GET /api/roadmap/planned → list planned items.
  - GET /api/changelog/entriesList → list changelog entries.
- Current codebase lacks these routes; add them to the Next.js app under [apps/app/src/app/api](file:///Users/dalyjean/Desktop/featul/apps/app/src/app/api/) backed by packages/api, or serve from widget-cdn as a reverse proxy.

## Performance & Security
- Debounce similar search at 600–800ms, limit to top 3.
- CORS: allow origins that load the widget; no credentials on public endpoints.
- Fingerprinting: reuse [fingerprint.ts](file:///Users/dalyjean/Desktop/featul/apps/app/src/utils/fingerprint.ts) for anonymous upvotes.
- Cache config in React Query; avoid repeated calls.
- No secrets embedded; only projectKey.

## Theming & Visibility
- theme: auto uses prefers‑color‑scheme.
- Hide Roadmap/Changelog tabs per config.visibility.
- Branding: primary color, powered‑by toggle.

## Testing & Verification
- widget-demo embeds the snippet and asserts global API behavior.
- E2E smoke: init → open → submit feedback with similar suggestions.
- Bundle size check and regression guard.

## Next Actions
- Scaffold the monorepo folders and package.json files.
- Implement the SDK files above.
- Add CDN app with a static file server or Hono worker.
- Add minimal styles, then wire API calls for each tab.
- Ship v1 to /widget/v1/featul.js and validate on demo site.
