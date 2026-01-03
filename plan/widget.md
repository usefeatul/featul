# featul Widget Specification (`@featul/widget`)

This document defines the first version of the **Featul Widget** used by customers to embed a unified feedback experience (feedback submit, roadmap, changelog) into their applications.

The goal is:

- One line snippet to install the widget via `<script>` tag
- One initialization call with a `projectKey`
- One unified UI with **three tabs** inside the same panel:
  - Feedback (submit only + similar suggestions)
  - Roadmap (planned only)
  - Changelog (release notes list)

The widget is primarily loaded as a JavaScript snippet injected into any HTML page. Internally it is React‑based and uses modern tooling, but integrators only need to add a script tag and call a small global API.

---

## 1. Snippet Overview

- **Primary installation:** HTML `<script>` snippet
- **No npm install required**
- Works on:
  - Any website (plain HTML, PHP, Rails, Laravel, etc.)
  - Any SPA framework (React, Vue, Svelte, Next.js, Remix, etc.)

The snippet sets up:

- A queue for widget commands before the SDK loads
- A global proxy object for commands (`window.featul`)
- A loader that fetches the SDK from the Featul CDN

Example snippet (added before `</body>`):

```html
<script>
  window.$ftq = window.$ftq || [];
  window.featul =
    window.featul ||
    new Proxy(
      {},
      {
        get: function (_, prop) {
          return function () {
            window.$ftq.push([prop].concat([].slice.call(arguments)));
          };
        },
      }
    );

  (function () {
    var s = document.createElement("script");
    s.src = "https://cdn.featul.com/widget/v1/featul.js";
    s.type = "module";
    s.async = true;
    document.head.appendChild(s);
  })();
</script>
```

Initialization:

```html
<script>
  window.featul.init("YOUR_PROJECT_KEY", {
    widget: true,
    theme: "auto",
    defaultTab: "feedback",
  });
</script>
```

Once installed, the widget button appears and users can:

- Submit feedback and ideas
- See similar existing posts
- View the planned roadmap
- Stay updated with changelog entries

Internally, the SDK remains React/TypeScript‑based, but integrators never need to install npm packages or import React components.

---

## 2. Global Widget API (`window.featul`)

The script exposes a single global object: `window.featul`.

Commands are queued until the SDK loads, then processed in order.

### 2.1 Core Methods

```ts
type FeatulWidgetTab = "feedback" | "roadmap" | "changelog";

interface FeatulInitOptions {
  widget?: boolean;
  theme?: "light" | "dark" | "auto";
  defaultTab?: FeatulWidgetTab;
  user?: {
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  };
}

interface FeatulGlobal {
  init: (projectKey: string, options?: FeatulInitOptions) => void;
  open: (tab?: FeatulWidgetTab) => void;
  close: () => void;
  toggle: () => void;
  identify: (user: FeatulInitOptions["user"]) => void;
}
```

Usage examples:

```html
<script>
  window.featul.init("YOUR_PROJECT_KEY", {
    widget: true,
    theme: "auto",
    defaultTab: "feedback",
  });
</script>

<script>
  window.featul.identify({
    id: "user_123",
    email: "user@example.com",
    name: "Demo User",
  });
</script>

<button onclick="window.featul.open('roadmap')">
  View roadmap
</button>
```

---

## 3. Widget UI Behavior

The widget renders as a floating button on the page. When opened, it shows a panel with three tabs at the bottom:

1. **Feedback** – submit form + similar suggestions
2. **Roadmap** – planned roadmap items
3. **Changelog** – changelog entries

Roadmap and Changelog tabs are **conditionally visible** based on workspace settings.

### 3.1 Feedback Tab

Purpose:

- Collect new feedback posts.
- Prevent duplicates by showing similar posts during typing.

Behavior:

- Shows:
  - Title input (required)
  - Description / details textarea (optional)
  - Optional additional inputs later (tags, category, etc.)
- While user types title:
  - Debounced (e.g. 500–1000ms) search via `post.getSimilar`:
    - Inputs: `title`, `boardSlug`, `workspaceSlug`
    - Returns up to 3 similar posts with:
      - `id`, `title`, `slug`, `upvotes`, `commentCount`
  - Renders a “Similar posts” list:
    - Each item shows title, votes, comment count.
    - Link points to the public post page on the Featul subdomain.
- On submit:
  - Calls `post.create` (public procedure) with:
    - Workspace slug / ID (resolved from `projectKey`)
    - Board slug (default public feedback board)
    - Title, description, metadata (fingerprint, user id etc.)
  - The API:
    - Creates the post in the configured board.
    - Auto‑upvotes the new post for the user/fingerprint.
  - Widget behavior on success:
    - Clears the form.
    - Shows a success message.
    - Optionally keeps panel open on Feedback tab.

Notes:

- The Feedback tab **does not list all existing posts**.
- It is intentionally focused on submission + duplicate prevention via similar posts.

### 3.2 Roadmap Tab

Purpose:

- Show only **planned** roadmap items for the workspace.

Behavior:

- Fetches planned posts via a public API that maps to:
  - `getPlannedRoadmapPosts(workspaceSlug, { limit, offset, order })`
  - Only posts with roadmap status `planned`.
- Renders a vertical list of items:
  - Title
  - Optional short content snippet
  - Board name/status badge if desired.
- Supports simple pagination (page/limit) if needed.
- Does not expose additional status filters in the widget (future extension only).

Visibility:

- Tab is hidden if the workspace roadmap board is not:
  - `isVisible = true` and `isPublic = true` on the system roadmap board.

### 3.3 Changelog Tab

Purpose:

- Show public changelog entries (release notes).

Behavior:

- Uses the same data semantics as the subdomain Changelog page:
  - `client.changelog.entriesList.$get({ slug: workspaceSlug })` or equivalent widget endpoint.
  - Response contains:
    - `id`, `title`, `summary`, `publishedAt`, `tags[]`.
- Renders entries as cards:
  - Title
  - Published date
  - Summary text
  - Tag pills

Visibility:

- Tab is hidden if:
  - Changelog system board is not visible (`isVisible = false` or `isPublic = false`).

---

## 4. Data and Configuration Flow

### 4.1 Workspace Resolution

Input: `projectKey` (string provided to the widget).

Resolution strategy:

1. Widget calls a configuration endpoint, e.g.:

   ```http
   GET /api/widget/config?projectKey={projectKey}
   ```

2. The endpoint returns:

   ```json
   {
     "workspaceId": "ws_123",
     "workspaceSlug": "acme",
     "name": "Acme Inc",
     "logo": "https://...",
     "branding": {
       "primary": "#6366f1",
       "theme": "dark",
       "layoutStyle": "default",
       "sidebarPosition": "right",
       "hidePoweredBy": false
     },
     "visibility": {
       "roadmap": true,
       "changelog": true
     },
     "feedback": {
       "defaultBoardSlug": "feedback"
     }
   }
   ```

3. Widget stores this in a React Query cache + local Zustand store and uses it for:
   - Which tabs to show.
   - Which board to post feedback into.
   - Branding (theme, primary color, powered‑by).

### 4.2 API Endpoints Used by the Widget

Minimal required endpoints (public or authenticated via user session):

- **Config**
  - `GET /api/widget/config?projectKey=...`
- **Feedback**
  - `POST /api/post/create` – create feedback (maps to `post.create`).
  - `GET /api/post/getSimilar?workspaceSlug=...&boardSlug=...&title=...` – similar posts.
- **Roadmap**
  - `GET /api/roadmap/planned?workspaceSlug=...&page=...&limit=...`
    - Internally uses `getPlannedRoadmapPosts`.
- **Changelog**
  - `GET /api/changelog/entriesList?slug=...`

The widget package should not assume it is running on the same origin as the app; it must use a configurable `baseUrl` if needed.

---

## 5. Internal SDK Structure

The CDN‑served SDK (for example, `featul.js`) is built from an internal package inside the monorepo, but consumers only see the script and `window.featul`.

Planned layout:

- `src/`
  - `bootstrap.ts` – reads `window.$ftq`, processes queued commands, attaches SDK to `window.featul`
  - `types.ts` – shared TypeScript/Zod schemas (user, config, tabs)
  - `store.ts` – Zustand store (open/close/tab state)
  - `widget-root.tsx` – main floating widget + tab bar + layout
  - `api/`
    - `client.ts` – thin fetch client with base URL and helpers
    - `queries.ts` – React Query hooks for config, roadmap, changelog
  - `tabs/`
    - `feedback-tab.tsx` – Feedback form + similar posts
    - `roadmap-tab.tsx` – planned roadmap list
    - `changelog-tab.tsx` – changelog list
  - `components/`
    - Reusable primitives for buttons, list items, etc.

---

## 6. Future Extensions (Optional)

Not part of the initial version, but planned:

- Show existing feedback list inside the Feedback tab (toggleable).
- Allow switching roadmap status filters (planned, in progress, completed).
- Support multiple widgets per page scoped to different projects.
- Deeper theming (fonts, corner radius, dark/light preferences) passed from the host app.
- Optional React wrapper that injects the script and exposes typed hooks.

The initial scope remains focused on:

- Feedback creation + duplicate suggestions.
- Planned roadmap visibility.
- Changelog visibility.
