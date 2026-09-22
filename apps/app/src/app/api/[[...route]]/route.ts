import { app } from "@featul/api/elysia";
import { withCors, handlePreflight } from "@featul/auth/trust";

/** Forwards all `/api/*` traffic to the jstack/Elysia app with CORS. */
const handler = (req: Request) => app.handle(req);

export const OPTIONS = handlePreflight;
export const GET = async (req: Request) => withCors(req, await handler(req));
export const POST = async (req: Request) => withCors(req, await handler(req));
