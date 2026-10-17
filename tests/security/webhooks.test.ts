import { expect, test } from "bun:test"
import { sendTestNotification } from "../../packages/api/src/services/webhook"

test("both webhook providers bound requests and hide sensitive failure details", async () => {
  const original = globalThis.fetch
  const destination = "https://hooks.example.invalid/secret-token"
  try {
    for (const provider of ["slack", "discord"] as const) {
      let cancelled = false
      globalThis.fetch = (async (_url, options) => {
        expect(options?.redirect).toBe("error")
        expect(options?.signal).toBeInstanceOf(AbortSignal)
        const response = new Response(new ReadableStream({
          start(controller) { controller.enqueue(new TextEncoder().encode("secret provider response")) },
          cancel() { cancelled = true },
        }), { status: 429 })
        return response
      }) as typeof fetch
      const failure = await sendTestNotification(provider, destination, "Synthetic workspace")
      expect(failure.success).toBe(false)
      expect(failure.error).toContain("429")
      expect(failure.error).not.toContain("secret")
      expect(cancelled).toBe(true)
      globalThis.fetch = (async () => { throw new Error(destination) }) as typeof fetch
      const network = await sendTestNotification(provider, destination, "Synthetic workspace")
      expect(network.success).toBe(false)
      expect(network.error).not.toContain("secret-token")
      globalThis.fetch = (async () => new Response(null, { status: 204 })) as typeof fetch
      expect((await sendTestNotification(provider, destination, "Synthetic workspace")).success).toBe(true)
    }
  } finally {
    globalThis.fetch = original
  }
})
