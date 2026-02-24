const INTERNAL_REDIRECT_BASE = "https://internal.featul.local";

export function normalizeInternalRedirectPath(raw: string): string {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (!value.startsWith("/")) return "";

  // Reject protocol-relative targets and ambiguous slash forms.
  if (value.startsWith("//") || value.includes("\\")) return "";

  try {
    const parsed = new URL(value, INTERNAL_REDIRECT_BASE);
    if (parsed.origin !== INTERNAL_REDIRECT_BASE) return "";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "";
  }
}
