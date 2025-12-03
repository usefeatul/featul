## What We’re Building
- Public “Reserve your subdomain” flow that lets visitors (no account) reserve a workspace `slug` tied to their email.
- A secure magic-link email confirms the reservation and locks that `slug` to the email.
- When the user later signs up, the workspace creation wizard auto-fills and locks the reserved `slug`.

## Data Model
- New table `workspaceSlugReservation` (Drizzle):
  - `id`, `slug` (unique, same rules as workspace slug), `email` (lower-cased), `token` (random UUID), `status` (`reserved | claimed | expired | cancelled`), `expiresAt`, `claimedAt`, `claimedByUserId` (nullable), `createdAt`, `updatedAt`.
  - Uniqueness rules: prevent reserving a `slug` if an active (non-expired, non-claimed) reservation exists or if a workspace already uses it (`packages/db/schema/workspace.ts`).
  - Optional `blockedReason` for staff overrides (e.g., premium or trademarked names).

## Validators
- Reuse existing workspace slug constraints (`packages/api/src/validators/workspace.ts`): `slugSchema` → `^[a-z]+$`, 5–32 chars.
- New `reservationInputSchema` with `{ email: z.string().email(), slug: slugSchema }` for public API.

## API Endpoints (Public + Private)
- Public `POST /api/reservations/reserve`:
  - Validate email and `slug`; check availability against workspaces and reservations.
  - Create reservation row with `token` and `expiresAt` (e.g., 30 days).
  - Send magic-link email to confirm reservation.
  - Idempotent: if an active reservation exists for that email+slug, re-send email and extend expiry minimally.
- Public `GET /api/reservations/lookup/:token`:
  - Return reservation display info for the confirmation page (workspace-style branding, `slug`).
- Public `POST /api/reservations/confirm`:
  - Body `{ token }`; marks reservation as `reserved` and records `email` ownership if still pending; returns a next-step URL.
  - Deny if token invalid or expired; allow reissue via `reserve`.
- Private `POST /api/reservations/claim-on-signup`:
  - During auth sign-up, if the verified email matches an active reservation, mark `claimed` and return locked `slug` for the wizard.
  - On workspace create, assert the slug is locked to that email; create workspace and finalize `claimedByUserId`.
- Availability helper:
  - Public `POST /api/reservations/checkSlug` that wraps existing checks and also considers reservations (or make current `workspace.checkSlug` public and extend its logic).

## Email Delivery
- Template: “Subdomain Reserved” magic-link email.
  - Use existing transport (`packages/auth/src/email/transport.ts`) and brand wrapper (`packages/auth/src/email/brandemail.tsx`).
  - New template component similar to `InviteWorkspaceEmail` (`packages/auth/src/email/inviteemail.tsx`).
- Link format: `${NEXT_PUBLIC_APP_URL}/reserve/${token}`.
  - Page shows the reserved `slug` and email and has a Confirm button.

## Confirmation & Linking Flow
- Visitor submits email + `slug` on the public form.
- They receive a magic link; open `/reserve/:token` page:
  - Page loads reservation via `lookup`; clicking Confirm calls `confirm` and shows success.
- Later, when they sign up with that email:
  - After email verification, backend checks for active reservation; wizard receives `{ slugLocked }` and disables the slug field.
  - Workspace creation (`packages/api/src/router/workspace.ts` → `create`) asserts lock before creating the workspace and then marks reservation `claimed`.
- If already logged in and email matches, `/reserve/:token` can directly set `slugLocked` in session and redirect to the wizard.

## UI Changes
- Public reserve form page (marketing app or `apps/feed`):
  - Fields: `email`, `slug`; client-side validation mirrors server rules (`apps/feed/src/lib/validators.ts`).
  - Calls `reservations.checkSlug` for instant availability; handles duplicate/blocked states.
- Confirmation page: `apps/feed/src/app/reserve/[token]/page.tsx` similar to invite page (`apps/feed/src/app/invite/[token]/page.tsx`).
- Wizard integration (`apps/feed/src/components/wizard/Wizard.tsx`):
  - Accept `slugLocked` from session/query; display locked value and skip availability re-check UI.

## Security & Abuse Protection
- One-time, expiring tokens (UUID); single-use on confirm; rotate on reissue.
- Email ownership: compare verified auth email at claim time; if mismatch, show 403 like invites.
- Rate-limit `reserve` by IP + email pair to prevent spam.
- Blocklist reserved names (system or trademarked) and profanity filter.
- Prevent races with DB unique constraints and transactional checks.

## Edge Cases
- Workspace already exists: reject with actionable message.
- Reservation expired: offer re-reserve; do not auto-extend without email click.
- Different email at signup: deny lock; allow manual change or ask to verify original email.
- Change of mind: add cancel endpoint to free the `slug`.

## Rollout Steps
1. Add `workspaceSlugReservation` schema and run migration via Drizzle.
2. Implement public reservation endpoints and email template.
3. Build public reserve form and confirmation page; wire to endpoints.
4. Extend availability check to include reservations.
5. Integrate wizard to accept `slugLocked` and enforce lock in `workspace.create`.
6. Add rate limiting and blocklist; QA flows and race conditions.

## Where This Integrates Today
- Slug rules: `packages/api/src/validators/workspace.ts`.
- Workspace uniqueness: `packages/db/schema/workspace.ts` and `packages/api/src/router/workspace.ts` (create/checkSlug).
- Invite/magic-link precedent: `packages/api/src/router/team.ts` + `apps/feed/src/app/invite/[token]/page.tsx`.
- Email transport/templates: `packages/auth/src/email/*`.

If this plan looks good, I’ll implement the schema, endpoints, email, and UI, reusing existing invite patterns and validators, and verify end-to-end with test reservations and a sample signup flow.