import { getWidgetSdkSource } from "@featul/widget/sdk-source";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(getWidgetSdkSource(), {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
}
