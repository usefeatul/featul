/** Shared columns for public lists, detail headers, and detail content. */
export function subdomainColumns(sidebarPosition: "left" | "right" = "right") {
  return sidebarPosition === "left"
    ? "grid w-full min-w-0 items-start gap-8 md:grid-cols-[236px_minmax(0,1fr)] lg:gap-10"
    : "grid w-full min-w-0 items-start gap-8 md:grid-cols-[minmax(0,1fr)_236px] lg:gap-10";
}
