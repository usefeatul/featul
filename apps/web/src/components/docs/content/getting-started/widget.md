---
title: Embed the widget
description: Add the Featul feedback widget to your app and securely identify signed-in users.
---

## Overview

The Featul widget lets customers browse feedback, submit ideas, vote, view your roadmap, and read updates without leaving your app.

Find your **Workspace ID** and **Widget secret** under **Settings → Workspace → Embed widget**.

## Install the widget

Add the loader and initialize Featul with your Workspace ID:

```html
<script>
  window.$featulq = window.$featulq || [];
  window.featul =
    window.featul ||
    new Proxy(
      {},
      {
        get:
          (_, method) =>
          (...args) =>
            window.$featulq.push([method, ...args]),
      },
    );
</script>

<script async src="https://app.featul.com/widget/sdk/v1.js"></script>

<script>
  featul.init("YOUR_WORKSPACE_ID", {
    widget: true,
    theme: "auto",
    position: "right",
  });
</script>
```

The loader is asynchronous. Calls made before it finishes are queued automatically.

## Configuration

`featul.init(workspaceId, options)` supports:

| Option           | Values                                             | Default     |
| ---------------- | -------------------------------------------------- | ----------- |
| `widget`         | `true`, `false`                                    | `true`      |
| `theme`          | `"light"`, `"dark"`, `"auto"`                      | `"auto"`    |
| `position`       | `"left"`, `"right"`                                | `"right"`   |
| `trigger`        | `"default"`, `"custom"`                            | `"default"` |
| `defaultSection` | `"home"`, `"feedback"`, `"roadmap"`, `"changelog"` | `"home"`    |
| `offset`         | `{ bottom, left, right }`                          | none        |

Use `trigger: "custom"` when your own button should open the widget:

```js
featul.init("YOUR_WORKSPACE_ID", {
  trigger: "custom",
  defaultSection: "feedback",
});

document.querySelector("#feedback-button").addEventListener("click", () => {
  featul.showWidget({ section: "feedback" });
});
```

## Identify signed-in users

Identification attributes posts, comments, and votes to the user's name and avatar. Generate the signature on your server after login.

```ts
import { createHmac } from "node:crypto";

export function createFeatulIdentity(user: {
  id: string;
  email: string;
  name?: string;
  image?: string;
}) {
  const email = user.email.trim().toLowerCase();
  const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
  const payload = JSON.stringify([
    1,
    process.env.FEATUL_WORKSPACE_ID!.trim(),
    user.id.trim(),
    email,
    user.name?.trim() || "",
    user.image?.trim() || "",
    expiresAt,
  ]);
  const signature = createHmac("sha256", process.env.FEATUL_WIDGET_SECRET!)
    .update(payload)
    .digest("hex");

  return {
    id: user.id,
    email,
    name: user.name,
    avatar: user.image,
    expiresAt,
    signature,
  };
}
```

Return that object from an authenticated endpoint in your app, then pass it to the widget:

```ts
const identity = await fetch("/api/featul-identity").then((response) =>
  response.json(),
);

window.featul?.identify(identity);
```

Clear the identity when the user logs out:

```ts
window.featul?.identify(null);
```

Unsigned, expired, modified, or invalid identities are treated as guests. Generate a fresh identity
after login and whenever the five-minute signature expires.

> Never include the Widget secret in browser code, public environment variables, or the embed snippet. Only the signed identity object is sent to the browser.

## Control the widget

```js
featul.showWidget();
featul.showWidget({ section: "roadmap" });
featul.hideWidget();
featul.destroy();
```

## Listen for events

Subscribe to widget lifecycle events:

```js
const onOpen = () => {
  console.log("Widget opened");
};

featul.on("ready", () => console.log("Widget ready"));
featul.on("open", onOpen);
featul.on("close", () => console.log("Widget closed"));

// Remove a listener when it is no longer needed.
featul.off("open", onOpen);
```

Available events are `ready`, `open`, and `close`.

## TypeScript API

```ts
type FeatulWidgetApi = {
  init(workspaceId: string, options?: FeatulWidgetOptions): void;
  identify(user: FeatulWidgetUser | null): void;
  showWidget(options?: {
    section?: "home" | "feedback" | "roadmap" | "changelog";
  }): void;
  hideWidget(): void;
  on(event: "ready" | "open" | "close", listener: () => void): void;
  off(event: "ready" | "open" | "close", listener: () => void): void;
  destroy(): void;
};
```

## Production checklist

- Keep the Widget secret on your server.
- Add every customer-app origin under **Settings → Workspace → Embed widget**.
- Call `identify` after login and `identify(null)` after logout.
- Use the versioned `/widget/sdk/v1.js` URL.
- Test the launcher on desktop and mobile layouts.
- Use a public board if guests should be able to submit feedback.
