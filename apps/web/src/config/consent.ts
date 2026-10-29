/** Hosted c15t backend; the root layout preconnects so the consent check starts early. */
export const CONSENT_BACKEND_URL =
  process.env.NEXT_PUBLIC_C15T_BACKEND_URL ||
  "https://featul-daly-jean-111nte1o.inth.app/";
