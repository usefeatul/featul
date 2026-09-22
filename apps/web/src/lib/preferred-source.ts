export const PREFERRED_SOURCE_SCRIPT_ID = "google-preferred-source-publisher"
export const PREFERRED_SOURCE_SCRIPT_SRC =
  "https://news.google.com/swg/js/v1/publisher.js"

export type PreferredSourceTheme = "light" | "dark"

export type PreferredSourceApi = {
  init: (options: { theme: PreferredSourceTheme; lang: string }) => void
  addPreferredSource: () => void
}

export type PreferredSourceQueue = Array<(api: PreferredSourceApi) => void>

export type PreferredSourceScriptElement = {
  id: string
  async: boolean
  src: string
  setAttribute: (name: string, value: string) => void
  getAttribute?: (name: string) => string | null
}

export type PreferredSourceDocument = {
  getElementById: (id: string) => { id: string } | null
  createElement: (tagName: "script") => PreferredSourceScriptElement
  head: { appendChild: (node: PreferredSourceScriptElement) => void }
}

type PreferredSourceGlobal = typeof globalThis & {
  PREFERRED_SOURCE?: PreferredSourceQueue
}

function getPreferredSourceGlobal(): PreferredSourceGlobal | undefined {
  if (typeof globalThis === "undefined") return undefined
  return globalThis as PreferredSourceGlobal
}

export function getPreferredSourceTheme(
  root: { classList: { contains: (token: string) => boolean } },
): PreferredSourceTheme {
  return root.classList.contains("dark") ? "dark" : "light"
}

export function getPreferredSourceLang(root: { lang?: string }): string {
  return root.lang || "en"
}

export function enqueuePreferredSource(
  callback: (api: PreferredSourceApi) => void,
) {
  const root = getPreferredSourceGlobal()
  if (!root) return
  const queue = (root.PREFERRED_SOURCE ??= [])
  queue.push(callback)
}

export function ensurePreferredSourceScript(doc?: PreferredSourceDocument) {
  const target =
    doc ??
    (typeof document === "undefined"
      ? undefined
      : (document as unknown as PreferredSourceDocument))
  if (!target) return

  if (target.getElementById(PREFERRED_SOURCE_SCRIPT_ID)) return

  const script = target.createElement("script")
  script.id = PREFERRED_SOURCE_SCRIPT_ID
  script.async = true
  script.src = PREFERRED_SOURCE_SCRIPT_SRC
  script.setAttribute("preferred-sources-control", "manual")
  target.head.appendChild(script)
}

export function initPreferredSource(options: {
  theme: PreferredSourceTheme
  lang: string
}) {
  enqueuePreferredSource((api) => api.init(options))
}

export function addPreferredSource() {
  enqueuePreferredSource((api) => api.addPreferredSource())
}
