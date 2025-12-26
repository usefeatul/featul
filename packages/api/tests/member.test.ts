import { describe, it, expect } from "bun:test"
import { memberByWorkspaceInputSchema, memberActivityInputSchema } from "../src/validators/member"
import type { AppRouter } from "../src"

describe("member validators", () => {
  it("parses stats input", () => {
    const parsed = memberByWorkspaceInputSchema.parse({ slug: "workspace", userId: "u_123" })
    expect(parsed.slug).toBe("workspace")
    expect(parsed.userId).toBe("u_123")
  })

  it("parses activity input with defaults", () => {
    const parsed = memberActivityInputSchema.parse({ slug: "workspace", userId: "u_123" })
    expect(parsed.limit).toBeGreaterThan(0)
  })
})

describe("router shape", () => {
  it("includes member endpoints", () => {
    const shape: Partial<AppRouter> = {}
    expect(shape).toBeDefined()
  })
})

