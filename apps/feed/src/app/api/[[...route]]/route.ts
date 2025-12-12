import { app } from "@oreilla/api/elysia";
import { withCors, handlePreflight } from "@oreilla/auth/trust";
const handler = (req: Request) => app.handle(req);

export const OPTIONS = handlePreflight;
export const GET = async (req: Request) => withCors(req, await handler(req));
export const POST = async (req: Request) => withCors(req, await handler(req));
