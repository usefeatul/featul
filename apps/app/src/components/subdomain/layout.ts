/** Shared columns for public lists, detail headers, and detail content. */
export function subdomainColumns(sidebarPosition: "left" | "right" = "right") {
  return sidebarPosition === "left"
    ? "grid w-full min-w-0 items-start gap-6 md:grid-cols-[minmax(220px,3fr)_minmax(0,7fr)]"
    : "grid w-full min-w-0 items-start gap-6 md:grid-cols-[minmax(0,7fr)_minmax(220px,3fr)]";
}
