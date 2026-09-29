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

## Weekly dependency updates

`.github/dependabot.yml` schedules GitHub Dependabot for Sundays at 18:00 in `Europe/London` (including daylight-saving changes). It checks the root Bun workspace, covering app, web and shared packages, and the pinned GitHub Actions versions.

Update pull requests target `staging`. Minor and patch package updates are grouped together; minor and patch action updates form another group. Major updates stay in separate pull requests. The limits are five open package update PRs and three open action update PRs. Updates are not automatically merged or deployed. Review the changes, wait for app/web checks, and manually verify affected features before merging.

The configuration must be merged into the default branch, `main`, to activate Dependabot, even though update PRs target `staging`. It needs no extra workflow or repository secret. GitHub may also perform an initial check when the configuration changes; scheduled runs are weekly. This schedule controls version updates, not separately enabled security alerts or security updates.

References: [Bun support](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories#bun), [Dependabot configuration](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference).
