export type ShareLink = { label: string; description: string; url: string };

export function buildShareLinks(
  boardUrl: string,
  visibility: { roadmap: boolean; changelog: boolean },
): ShareLink[] {
  const origin = boardUrl.replace(/\/$/, "");
  return [
    {
      label: "Feedback",
      description: "Ideas, requests, and conversations",
      url: origin,
    },
    ...(visibility.roadmap
      ? [
          {
            label: "Roadmap",
            description: "What you’re working on next",
            url: `${origin}/roadmap`,
          },
        ]
      : []),
    ...(visibility.changelog
      ? [
          {
            label: "Changelog",
            description: "The latest product updates",
            url: `${origin}/changelog`,
          },
        ]
      : []),
  ];
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

export function buildSignature(
  name: string,
  workspaceName: string,
  boardUrl: string,
) {
  const text = `${name} · ${workspaceName}\nHelp shape what we build next.\nShare an idea: ${boardUrl}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6"><strong>${escapeHtml(name)} · ${escapeHtml(workspaceName)}</strong><br>Help shape what we build next.<br><a href="${escapeHtml(boardUrl)}">Share an idea →</a></div>`;
  return { text, html };
}

export function buildLinksHtml(links: ShareLink[]) {
  return `<nav aria-label="Product resources">\n${links.map((link) => `  <a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join("\n")}\n</nav>`;
}

export function buildShareMessages(name: string, boardUrl: string) {
  return [
    {
      id: "community",
      label: "Community",
      description: "For Slack, Discord, or your community forum.",
      text: `What would make ${name} better for you?\n\nWe’ve made a space for your ideas. Add a request, vote on something you’d use, or tell us what’s getting in your way.\n\nJoin the conversation: ${boardUrl}`,
    },
    {
      id: "email",
      label: "Email",
      description: "A personal invitation to your customers.",
      text: `Subject: What should we improve in ${name}?\n\nHi there,\n\nYou use ${name}, so you know where it could be better. We’d love to hear your ideas — big improvements and small fixes alike.\n\nLeave feedback or vote on an existing request here:\n${boardUrl}\n\nThanks for helping us decide what comes next.`,
    },
    {
      id: "support",
      label: "Support reply",
      description: "Keep a helpful next step ready for your support team.",
      text: `Thanks for sharing this idea for ${name}. Could you add it to our feedback board? That gives it a home where others can add context and vote.\n\n${boardUrl}\n\nYour input helps us understand what matters most.`,
    },
    {
      id: "developer",
      label: "Developer handoff",
      description: "Send your developer the links and setup instructions.",
      text: `Please add a feedback entry point to ${name}.\n\nBoard: ${boardUrl}\n\nLink to it from our help menu or app footer. For an in-app experience, use the Featul widget snippet from our workspace’s Share page.\n\nSetup guide: https://www.featul.com/docs/getting-started/widget\n\nIf we identify signed-in users, generate the identity signature on our server; keep the signing secret out of browser code.`,
    },
  ];
}

export function buildWidgetSteps(
  workspaceId: string,
  theme: "auto" | "light" | "dark" = "auto",
  position: "left" | "right" = "right",
) {
  const id = JSON.stringify(workspaceId).replace(/</g, "\\u003c");
  const loader = `<script>
  window.$featulq = window.$featulq || [];
  window.featul = window.featul || new Proxy({}, {
    get: (_, method) => (...args) => window.$featulq.push([method, ...args])
  });
</script>
<script async src="https://app.featul.com/widget/sdk/v1.js"></script>`;
  const init = `<script>
  featul.init(${id}, {
    widget: true,
    theme: "${theme}",
    position: "${position}"
  });
</script>`;
  return { loader, init };
}

export function buildWidgetSnippet(
  workspaceId: string,
  theme: "auto" | "light" | "dark" = "auto",
  position: "left" | "right" = "right",
) {
  const { loader, init } = buildWidgetSteps(workspaceId, theme, position);
  return `${loader}\n${init}`;
}

export function buildWidgetNextSnippet(
  workspaceId: string,
  theme: "auto" | "light" | "dark" = "auto",
  position: "left" | "right" = "right",
) {
  const id = JSON.stringify(workspaceId).replace(/</g, "\\u003c");
  return `import Script from "next/script";

export function FeatulWidget() {
  return (
    <>
      <Script id="featul-widget" strategy="afterInteractive">{\`
        window.$featulq = window.$featulq || [];
        window.featul = window.featul || new Proxy({}, {
          get: (_, method) => (...args) => window.$featulq.push([method, ...args])
        });
        featul.init(${id}, {
          widget: true,
          theme: "${theme}",
          position: "${position}"
        });
      \`}</Script>
      <Script
        src="https://app.featul.com/widget/sdk/v1.js"
        strategy="afterInteractive"
      />
    </>
  );
}`;
}
