import { getWidgetSdkSource } from "@featul/widget/sdk-source";

export const dynamic = "force-static";

export function GET() {
  return new Response(getWidgetSdkSource(), {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
