/**
 * Domain that hosts workspace portals as `{slug}.{ROOT_DOMAIN}`. Self-hosted installs set
 * NEXT_PUBLIC_ROOT_DOMAIN at build time; Featul Cloud keeps the default.
 */
export const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "featul.com").trim().toLowerCase();

/** `{slug}.{ROOT_DOMAIN}`, without protocol. */
export function workspaceHost(slug: string) {
  return `${slug}.${ROOT_DOMAIN}`;
}
