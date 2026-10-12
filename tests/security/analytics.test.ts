import { afterAll, expect, mock, test } from "bun:test"
import { Window } from "happy-dom"
import { parseAnalyticsConsent, readAnalyticsConsent, writeAnalyticsConsent } from "../../packages/ui/src/lib/consent"

test("analytics consent requires a recognized explicit opt-in", () => {
  expect(parseAnalyticsConsent("")).toBeNull()
  expect(parseAnalyticsConsent("featul_analytics=true")).toBeNull()
  expect(parseAnalyticsConsent("featul_analytics=v1.granted")).toBe("granted")
  expect(parseAnalyticsConsent("other=1; featul_analytics=v1.denied")).toBe("denied")
  expect(parseAnalyticsConsent("featul_analytics=v1.granted; featul_analytics=v1.denied")).toBe("denied")
})

test("analytics never initializes before consent and stops after withdrawal", async () => {
  const saved = Object.fromEntries(["window", "document", "navigator", "Event"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const oldToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const browser = new Window({ url: "https://app.featul.com" })
  for (const [key, value] of Object.entries({ window: browser, document: browser.document, navigator: browser.navigator, Event: browser.Event })) {
    Object.defineProperty(globalThis, key, { configurable: true, value })
  }
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "synthetic-test-token"
  const sdk = { init: mock(() => {}), opt_in_capturing: mock(() => {}), opt_out_capturing: mock(() => {}), capture: mock(() => {}), identify: mock(() => {}), reset: mock(() => {}) }
  mock.module("posthog-js", () => ({ default: sdk }))
  try {
    const analytics = await import("../../apps/app/src/lib/posthog")
    analytics.captureAnalyticsEvent("post_created")
    analytics.identifyAnalyticsUser({ id: "synthetic-user" })
    expect(sdk.init).not.toHaveBeenCalled()
    writeAnalyticsConsent("denied")
    analytics.synchronizeAnalyticsConsent()
    expect(sdk.init).not.toHaveBeenCalled()
    writeAnalyticsConsent("granted")
    analytics.captureAnalyticsEvent("post_created")
    expect(sdk.init).toHaveBeenCalledTimes(1)
    expect(sdk.opt_in_capturing).toHaveBeenCalledTimes(1)
    expect(sdk.identify).toHaveBeenCalledWith("synthetic-user")
    expect(sdk.capture).toHaveBeenCalledTimes(1)
    const config = (sdk.init.mock.calls as unknown as [string, { before_send: (event: unknown) => unknown; disable_session_recording: boolean; autocapture: boolean }][])[0]![1]
    expect(config.disable_session_recording).toBe(true)
    expect(config.autocapture).toBe(false)
    writeAnalyticsConsent("denied")
    expect(config.before_send({ event: "queued" })).toBeNull()
    analytics.captureAnalyticsEvent("post_created")
    expect(sdk.opt_out_capturing).toHaveBeenCalledTimes(1)
    expect(sdk.capture).toHaveBeenCalledTimes(1)
    analytics.resetAnalyticsUser()
    writeAnalyticsConsent("granted")
    Object.defineProperty(browser.navigator, "globalPrivacyControl", { configurable: true, value: true })
    expect(readAnalyticsConsent()).toBe("denied")
    analytics.captureAnalyticsEvent("post_created")
    expect(sdk.capture).toHaveBeenCalledTimes(1)
    // GPC overrides a stored grant without silently overwriting the saved preference.
    expect(browser.document.cookie).toContain("featul_analytics=v1.granted")
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
    if (oldToken === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    else process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = oldToken
    await browser.happyDOM.close()
  }
})

afterAll(() => mock.restore())
