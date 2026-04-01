import { db as database } from "@featul/db"

export type AuthenticatedRouterContext = {
  db: typeof database
  session: { user: { id: string } }
}
