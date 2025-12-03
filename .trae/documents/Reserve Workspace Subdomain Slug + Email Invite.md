## What I Found

* Auth uses Better Auth’s organization plugin on server and client to track the active workspace and expose org helpers.

* Invites are implemented in the team router with full lifecycle: create → email → accept/decline → membership insert → redirect.

## Proposed Deliverables

1. Create a concise developer guide: `docs/auth-org-invite.md`

   * Explain how organization is wired (server+client) and how `setActive` works.

   * Walk the invite flow end-to-end with code references and key permission/plan checks.
2. Add a short pointer section to `packages/auth/README.md`

   * Link to the new doc and list the primary entry points (`auth.ts`, `client.ts`, `workspace.ts`).
3. Optional: add an endpoints summary table in `docs/auth-org-invite.md`

   * List `team` router methods with input/output and error conditions.

## No Code Behavior Changes

* Only documentation files will be added/updated.

* No runtime or configuration changes.

## Next Steps

* On approval, I will add the doc and README pointer with the structure outlined above and keep code references accurate to the current repo.

