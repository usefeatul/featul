import { AUTH_SIGN_IN_URL, LIVE_DEMO_URL } from "@/config/auth";

export interface NavigationItem {
  name: string;
  href: string;
  description?: string;
  icon?: NavIconName;
  external?: boolean;
}

export type NavIconName =
  | "feedback"
  | "requests"
  | "voting"
  | "roadmap"
  | "changelog"
  | "widget"
  | "dashboard"
  | "docs"
  | "definitions"
  | "tools"
  | "use-cases"
  | "open-source"
  | "integrations"
  | "blog"
  | "demo"
  | "domain";

export interface NavigationColumn {
  title: string;
  items: NavigationItem[];
}

export interface NavigationHighlight {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export interface NavigationEntry {
  name: string;
  href?: string;
  columns?: NavigationColumn[];
  highlight?: NavigationHighlight;
  footer?: NavigationItem;
}

export interface NavigationConfig {
  main: NavigationEntry[];
  auth: NavigationItem[];
}

export const navigationConfig: NavigationConfig = {
  main: [
    {
      name: "Features",
      columns: [
        {
          title: "Collect",
          items: [
            {
              name: "Customer feedback",
              href: "/docs/getting-started/guest-feedback",
              description: "Boards for requests and comments",
              icon: "feedback",
            },
            {
              name: "Feature requests",
              href: "/docs/getting-started/create-boards",
              description: "Let customers submit ideas",
              icon: "requests",
            },
            {
              name: "Feature voting",
              href: "/use-cases/feature-voting-board",
              description: "Prioritize by what users want",
              icon: "voting",
            },
            {
              name: "Feedback widget",
              href: "/docs/getting-started/widget",
              description: "Collect ideas in your product",
              icon: "widget",
            },
          ],
        },
        {
          title: "Ship",
          items: [
            {
              name: "Product roadmap",
              href: "/docs/getting-started/plan-roadmap",
              description: "Planned, now, and shipped",
              icon: "roadmap",
            },
            {
              name: "Product changelog",
              href: "/docs/getting-started/publish-updates",
              description: "Close the loop when you ship",
              icon: "changelog",
            },
            {
              name: "Dashboard",
              href: "/docs/getting-started/overview",
              description: "Review and merge in one place",
              icon: "dashboard",
            },
          ],
        },
        {
          title: "Connect",
          items: [
            {
              name: "Integrations",
              href: "/integrations",
              description: "Slack, Discord, and imports",
              icon: "integrations",
            },
            {
              name: "Custom domain",
              href: "/docs/branding-setup/domain",
              description: "feedback.yourbrand.com",
              icon: "domain",
            },
            {
              name: "Live demo",
              href: LIVE_DEMO_URL,
              description: "Open a live Featul workspace",
              icon: "demo",
              external: true,
            },
          ],
        },
      ],
      footer: {
        name: "Switching from Canny or Productboard? Compare Featul",
        href: "/alternatives",
      },
    },
    {
      name: "Resources",
      columns: [
        {
          title: "Learn",
          items: [
            {
              name: "Documentation",
              href: "/docs",
              description: "Set up boards, roadmaps, and changelogs",
              icon: "docs",
            },
            {
              name: "Blog",
              href: "/blog",
              description: "Product news and writing",
              icon: "blog",
            },
            {
              name: "Definitions",
              href: "/definitions",
              description: "Glossary for feedback teams",
              icon: "definitions",
            },
            {
              name: "Free tools",
              href: "/tools",
              description: "Calculators and planning helpers",
              icon: "tools",
            },
          ],
        },
        {
          title: "Explore",
          items: [
            {
              name: "Use cases",
              href: "/use-cases",
              description: "How teams collect and ship feedback",
              icon: "use-cases",
            },
            {
              name: "Integrations",
              href: "/integrations",
              description: "Slack, Discord, and import paths",
              icon: "integrations",
            },
            {
              name: "Open source",
              href: "/docs/open-source",
              description: "MIT licensed on GitHub",
              icon: "open-source",
            },
            {
              name: "Live demo",
              href: LIVE_DEMO_URL,
              description: "Open a live Featul workspace",
              icon: "demo",
              external: true,
            },
          ],
        },
      ],
      highlight: {
        eyebrow: "What's new",
        title: "From upvote to shipped",
        description:
          "Boards, roadmaps, and changelogs in one workspace — hosted in the EU.",
        href: "/docs/getting-started",
        cta: "Read the docs",
      },
    },
    {
      name: "Docs",
      href: "/docs",
    },
    {
      name: "Pricing",
      href: "/pricing",
    },
  ],
  auth: [
    {
      name: "Sign in",
      href: AUTH_SIGN_IN_URL,
    },
  ],
};

export function isNavDropdown(
  item: NavigationEntry,
): item is NavigationEntry & { columns: NavigationColumn[] } {
  return Boolean(item.columns?.length);
}

export function isExternalHref(item: Pick<NavigationItem, "href" | "external">) {
  return (
    item.external === true ||
    item.href.startsWith("http://") ||
    item.href.startsWith("https://")
  );
}
