import * as ct from "countries-and-timezones";

/** City and country label for an IANA timezone. */
export function friendlyTimezone(tz: string) {
  const city = tz.split("/").slice(-1)[0]?.replace(/_/g, " ") ?? tz;
  const country = ct.getCountryForTimezone(tz)?.name;
  return country ? `${city}, ${country}` : city;
}

export function friendlyTimezoneCity(tz: string) {
  return tz.split("/").slice(-1)[0]?.replace(/_/g, " ") ?? tz;
}

/** IANA options; until mounted, keeps the list small for hydration. */
export function getTimezoneOptions(mounted: boolean) {
  const base = [
    "UTC",
    "Europe/London",
    "Europe/Paris",
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Tokyo",
  ];

  if (!mounted) {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected && !base.includes(detected)) return [detected, ...base];
    return base;
  }

  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];
  if (supported.length) return supported;

  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (detected && !base.includes(detected)) return [detected, ...base];
  return base;
}

/** Filters by IANA id or friendly city/country label. */
export function filterTimezones(
  timezones: string[],
  query: string,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return timezones;
  return timezones.filter(
    (tz) =>
      tz.toLowerCase().includes(q) ||
      friendlyTimezone(tz).toLowerCase().includes(q),
  );
}
