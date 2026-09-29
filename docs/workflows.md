# App and web checks

`.github/workflows/checks.yml` runs on pull requests, pushes to `main` and `staging`, and manual dispatch. It creates two independent jobs:

- `app / lint, types, build`
- `web / lint, types, build`

Each job installs the frozen lockfile, lints its workspace and shared dependencies, generates Next.js route types, checks TypeScript, and builds the workspace. The web build also runs its existing SEO validation. Both jobs run for every change so shared-package changes cannot bypass validation. New runs cancel older runs for the same pull request or branch.

There are no automated tests, database migrations, or deployment steps. Manual product testing remains the release process. Vercel continues to manage deployments separately.

No GitHub secrets are required. The database URL, Redis settings, and auth values are build-only placeholders; build output must not be deployed. This validates compilation and static pages, not Stripe, database connectivity, CMS content, email delivery, or production configuration.

The workflow uses Node 22, Ubuntu 24.04, and the Bun version declared in the root `package.json`. Actions are pinned to commit hashes. Update the version comments and hashes together when upgrading.

After the workflow is pushed and has run, add both job names as required status checks in the GitHub rulesets for `main` and `staging` if merges should require successful checks. This file does not change repository rules or Vercel's deployment settings.

For local checks, replace `app` with `web` as needed:

```sh
bun install --frozen-lockfile
bunx --no-install turbo run lint --filter='app...'
bunx --no-install next typegen apps/app
bunx --no-install turbo run check-types --filter='app...'
bunx --no-install turbo run build --filter=app
```

Local builds use local environment files when present; GitHub uses only the build placeholders above.
