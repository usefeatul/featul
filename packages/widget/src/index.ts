export type FeatulWidgetSection = "home" | "feedback" | "roadmap" | "changelog";
export type FeatulWidgetEvent = "ready" | "open" | "close";

export type FeatulWidgetOptions = {
  widget?: boolean;
  theme?: "light" | "dark" | "auto";
  position?: "left" | "right";
  trigger?: "default" | "custom";
  defaultSection?: FeatulWidgetSection;
  offset?: {
    bottom?: number;
    left?: number;
    right?: number;
  };
};

export type FeatulWidgetUser = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  expiresAt: number;
  signature: string;
};

export type FeatulWidgetApi = {
  init(projectId: string, options?: FeatulWidgetOptions): void;
  identify(user: FeatulWidgetUser | null): void;
  showWidget(options?: { section?: FeatulWidgetSection }): void;
  hideWidget(): void;
  on(event: FeatulWidgetEvent, listener: (payload?: unknown) => void): void;
  off(event: FeatulWidgetEvent, listener: (payload?: unknown) => void): void;
  destroy(): void;
};

declare global {
  interface Window {
    featul?: FeatulWidgetApi;
    $featulq?: unknown[];
    __featulWidgetLoaded?: boolean;
  }
}
