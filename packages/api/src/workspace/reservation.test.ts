import { describe, expect, test } from "bun:test"
import { isReservationConfirmed, isReservationLive, isSlugHeldForOtherEmail } from "./reservation"

const now = new Date("2026-01-01T00:00:00Z")
const later = new Date(now.getTime() + 60_000)
const earlier = new Date(now.getTime() - 60_000)

describe("slug reservations", () => {
  test("pending reservations are live but never hold a slug", () => {
    const pending = { email: "a@example.com", status: "reserved", confirmedAt: null, expiresAt: later }
    expect(isReservationLive(pending, now)).toBe(true)
    expect(isReservationConfirmed(pending, now)).toBe(false)
    expect(isSlugHeldForOtherEmail(pending, "b@example.com", now)).toBe(false)
  })

  test("confirmed reservations hold the slug only against other emails", () => {
    const confirmed = { email: "a@example.com", status: "reserved", confirmedAt: earlier, expiresAt: later }
    expect(isSlugHeldForOtherEmail(confirmed, "b@example.com", now)).toBe(true)
    expect(isSlugHeldForOtherEmail(confirmed, "A@Example.com", now)).toBe(false)
  })

  test("expired, claimed, or missing reservations hold nothing", () => {
    const base = { email: "a@example.com", status: "reserved", confirmedAt: earlier, expiresAt: later }
    expect(isSlugHeldForOtherEmail({ ...base, expiresAt: earlier }, "b@example.com", now)).toBe(false)
    expect(isSlugHeldForOtherEmail({ ...base, status: "claimed" }, "b@example.com", now)).toBe(false)
    expect(isSlugHeldForOtherEmail(undefined, "b@example.com", now)).toBe(false)
  })
})
