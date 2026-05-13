export type FeatulWidgetSection = "feedback" | "roadmap" | "changelog";

export type FeatulWidgetOptions = {
  widget?: boolean;
  theme?: "light" | "dark" | "auto";
  position?: "left" | "right";
  trigger?: "default" | "custom";
  defaultSection?: FeatulWidgetSection;
};

export type FeatulWidgetUser = {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  signature?: string;
};

export type FeatulWidgetApi = {
  init(projectId: string, options?: FeatulWidgetOptions): void;
  identify(user: FeatulWidgetUser): void;
  showWidget(options?: { section?: FeatulWidgetSection }): void;
  hideWidget(): void;
  destroy(): void;
};

declare global {
  interface Window {
    featul?: FeatulWidgetApi;
    $featulq?: unknown[];
  }
}
