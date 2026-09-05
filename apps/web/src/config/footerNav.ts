import { LIVE_DEMO_URL } from "@/config/auth";
import type { NavigationItem } from "./homeNav";

export type FooterIconName =
  | "feedback"
  | "requests"
  | "voting"
  | "roadmap"
  | "changelog"
  | "widget"
  | "dashboard"
  | "slack"
  | "docs"
  | "definitions"
  | "tools"
  | "use-cases"
  | "open-source"
  | "start"
  | "pricing"
  | "integrations"
  | "blog"
  | "demo"
  | "contact"
  | "privacy"
  | "terms"
  | "gdpr";

export interface FooterNavItem extends NavigationItem {
  icon?: FooterIconName;
}

export interface FooterNavGroup {
  title: string;
  items: FooterNavItem[];
}

export interface FooterNavColumn {
  groups: FooterNavGroup[];
}

export interface FooterSocialLink {
  name: string;
  href: string;
  icon: "github" | "mail";
}

export interface FooterNavigationConfig {
  columns: FooterNavColumn[];
  groups: FooterNavGroup[];
  socials: FooterSocialLink[];
}

const columns: FooterNavColumn[] = [
  {
    groups: [
      {
        title: "Features",
        items: [
          {
            name: "Customer feedback",
            href: "/docs/getting-started/guest-feedback",
            icon: "feedback",
          },
          {
            name: "Feature requests",
            href: "/docs/getting-started/create-boards",
            icon: "requests",
          },
          {
            name: "Feature voting",
            href: "/use-cases/feature-voting-board",
            icon: "voting",
          },
          {
            name: "Product roadmap",
            href: "/docs/getting-started/plan-roadmap",
            icon: "roadmap",
          },
          {
            name: "Product changelog",
            href: "/docs/getting-started/publish-updates",
            icon: "changelog",
          },
          {
            name: "Feedback widget",
            href: "/docs/getting-started/widget",
            icon: "widget",
          },
          {
            name: "Dashboard",
            href: "/docs/getting-started/overview",
            icon: "dashboard",
          },
          { name: "Slack", href: "/integrations/slack", icon: "slack" },
        ],
      },
      {
        title: "Resources",
        items: [
          { name: "Documentation", href: "/docs", icon: "docs" },
          { name: "Definitions", href: "/definitions", icon: "definitions" },
          { name: "Free tools", href: "/tools", icon: "tools" },
          { name: "Use cases", href: "/use-cases", icon: "use-cases" },
          { name: "Open source", href: "/docs/open-source", icon: "open-source" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: "Product",
        items: [
          { name: "Get started", href: "/docs/getting-started", icon: "start" },
          { name: "Pricing", href: "/pricing", icon: "pricing" },
          { name: "Integrations", href: "/integrations", icon: "integrations" },
          { name: "Blog", href: "/blog", icon: "blog" },
          {
            name: "Live demo",
            href: LIVE_DEMO_URL,
            icon: "demo",
            external: true,
          },
        ],
      },
      {
        title: "Get help",
        items: [
          {
            name: "Contact",
            href: "mailto:contact@featul.com",
            icon: "contact",
          },
          { name: "Privacy", href: "/privacy", icon: "privacy" },
          { name: "Terms", href: "/terms", icon: "terms" },
          { name: "GDPR", href: "/gdpr", icon: "gdpr" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: "Compare",
        items: [
          { name: "Featurebase alternative", href: "/alternatives/featurebase" },
          { name: "Canny alternative", href: "/alternatives/canny" },
          { name: "UserJot alternative", href: "/alternatives/userjot" },
          { name: "Nolt alternative", href: "/alternatives/nolt" },
          { name: "Productboard alternative", href: "/alternatives/productboard" },
          { name: "UserVoice alternative", href: "/alternatives/uservoice" },
          { name: "Beamer alternative", href: "/alternatives/beamer" },
          { name: "Pendo alternative", href: "/alternatives/pendo" },
          { name: "Aha! alternative", href: "/alternatives/aha" },
          { name: "Upvoty alternative", href: "/alternatives/upvoty" },
          { name: "Other alternatives", href: "/alternatives" },
        ],
      },
    ],
  },
];

export const footerNavigationConfig: FooterNavigationConfig = {
  columns,
  groups: columns.flatMap((column) => column.groups),
  socials: [
    {
      name: "GitHub",
      href: "https://github.com/usefeatul/feautl",
      icon: "github",
    },
    {
      name: "Email",
      href: "mailto:contact@featul.com",
      icon: "mail",
    },
  ],
};
