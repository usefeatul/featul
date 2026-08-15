import { getWidgetSdkSource } from "@featul/widget/source";

export const dynamic = "force-static";

const SCRIPT_HEADERS = {
  "content-type": "application/javascript; charset=utf-8",
  "cache-control": "public, max-age=31536000, immutable",
};

export function GET() {
  return new Response(getWidgetSdkSource(), { headers: SCRIPT_HEADERS });
}
