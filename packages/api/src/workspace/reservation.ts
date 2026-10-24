// An unconfirmed reservation only lives long enough for the owner to click the emailed link.
export const PENDING_RESERVATION_TTL_MS = 24 * 60 * 60 * 1000
export const CONFIRMED_RESERVATION_TTL_MS = 30 * 24 * 60 * 60 * 1000
export const MAX_RESERVATIONS_PER_EMAIL = 3

export type ReservationState = {
  email?: string | null
  status: string
  confirmedAt?: Date | null
  expiresAt?: Date | null
}

export function isReservationLive(r: ReservationState | null | undefined, now = new Date()): boolean {
  return Boolean(r && r.status === "reserved" && r.expiresAt && r.expiresAt.getTime() > now.getTime())
}

/** Only a confirmed, unexpired reservation holds a slug against workspace creation. */
export function isReservationConfirmed(r: ReservationState | null | undefined, now = new Date()): boolean {
  return Boolean(r && isReservationLive(r, now) && r.confirmedAt)
}

export function isSlugHeldForOtherEmail(
  r: ReservationState | null | undefined,
  email: string | null | undefined,
  now = new Date(),
): boolean {
  if (!r || !isReservationConfirmed(r, now)) return false
  return String(r.email || "").toLowerCase() !== String(email || "").toLowerCase()
}
