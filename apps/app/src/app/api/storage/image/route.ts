import { auth } from "@featul/auth/auth";
import { deliverImage } from "@featul/api/storage/delivery";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return deliverImage(request, session?.user.id || null);
}
