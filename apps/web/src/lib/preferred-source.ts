export const PREFERRED_SOURCE_SCRIPT_ID = "google-preferred-source-publisher";
export const PREFERRED_SOURCE_SCRIPT_SRC =
  "https://news.google.com/swg/js/v1/publisher.js";

export type PreferredSourceTheme = "light" | "dark";

export type PreferredSourceApi = {
  init: (options: { theme: PreferredSourceTheme; lang: string }) => void;
  addPreferredSource: () => void;
};

export type PreferredSourceQueue = Array<(api: PreferredSourceApi) => void>;

type PreferredSourceGlobal = typeof globalThis & {
  PREFERRED_SOURCE?: PreferredSourceQueue;
};

function getPreferredSourceGlobal(): PreferredSourceGlobal | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return globalThis as PreferredSourceGlobal;
}

export function getPreferredSourceTheme(root: {
  classList: { contains: (token: string) => boolean };
}): PreferredSourceTheme {
  return root.classList.contains("dark") ? "dark" : "light";
}

export function getPreferredSourceLang(root: { lang?: string }): string {
  return root.lang || "en";
}

export function enqueuePreferredSource(
  callback: (api: PreferredSourceApi) => void,
) {
  const root = getPreferredSourceGlobal();
  if (!root) return;
  const queue = (root.PREFERRED_SOURCE ??= []);
  queue.push(callback);
}

export function initPreferredSource(options: {
  theme: PreferredSourceTheme;
  lang: string;
}) {
  enqueuePreferredSource((api) => api.init(options));
}

export function addPreferredSource() {
  enqueuePreferredSource((api) => api.addPreferredSource());
}
