export function markdownResponse(body: string, describedBy = "/llms.txt") {
  return new Response(body.endsWith("\n") ? body : `${body}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      Link: `<${describedBy}>; rel="describedby"`,
    },
  })
}
