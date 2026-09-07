export const revalidate = 3600

const SELINE_SCRIPT_URL = "https://cdn.seline.com/seline.js"

export async function GET() {
  const upstream = await fetch(SELINE_SCRIPT_URL, {
    next: { revalidate },
    headers: { Accept: "text/javascript, application/javascript, */*" },
  })

  if (!upstream.ok) {
    return new Response("Failed to load analytics script", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  return new Response(await upstream.text(), {
    status: 200,
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
