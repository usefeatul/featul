import { PostHog } from "posthog-node"

type ServerAnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>

function cleanProperties(properties?: ServerAnalyticsProperties) {
  if (!properties) return undefined

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  )
}

export async function captureServerAnalyticsEvent(
  event: string,
  distinctId: string,
  properties?: ServerAnalyticsProperties,
) {
  const token = (process.env.NEXT_PUBLIC_POSTHOG_TOKEN || "").trim()
  if (!token || !distinctId) return

  const client = new PostHog(token, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  })

  try {
    client.capture({
      distinctId,
      event,
      properties: cleanProperties(properties),
    })
  } finally {
    await client.shutdown()
  }
}
