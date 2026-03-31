# @featul/auth

`@featul/auth` is the shared authentication and billing package used across the Featul monorepo. It wraps Better Auth, connects auth to the Featul database, provides workspace-aware auth helpers, and includes billing, email, and trust utilities used by the main application.

## What This Package Handles

- Better Auth configuration and database adapter setup
- passkey, OTP, two-factor, multi-session, and organisation support
- workspace-aware auth and session helpers
- password and verification flows
- billing helpers and Stripe integration glue
- auth-related email templates and transport utilities
- trusted-origin and trust helpers

## Main Exports

- `@featul/auth`
- `@featul/auth/client`
- `@featul/auth/auth`
- `@featul/auth/server`
- `@featul/auth/billing`
- `@featul/auth/workspace`
- `@featul/auth/password`
- `@featul/auth/session`
- `@featul/auth/email`
- `@featul/auth/trusted-origins`
- `@featul/auth/trust`

## Package Layout

```text
src/
├── auth.ts                    # Better Auth setup and plugin wiring
├── client.ts                  # Client-side auth helpers
├── billing.ts                 # Workspace billing sync and plan logic
├── stripe.ts                  # Stripe helpers used by auth and billing flows
├── workspace.ts               # Workspace-aware auth utilities
├── session.ts                 # Session helpers
├── password.ts                # Password validation and helpers
├── trusted-origins.ts         # Trusted-origin parsing and validation
├── trust.ts                   # Additional trust/security helpers
└── email/                     # Email templates and delivery helpers
```

## Usage

```ts
import { auth } from "@featul/auth/server"
import { createAuthClient } from "@featul/auth/client"
```

## Notes

This package depends on `@featul/db` for persistence and uses environment variables supplied by the app workspace, especially for auth, Stripe, trusted origins, and analytics.
