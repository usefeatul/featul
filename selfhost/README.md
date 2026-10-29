# Self-hosting Featul

There are two ways to run your own Featul:

- **[Your own server](#your-own-server)** with Docker: one command, everything on one machine.
- **[Vercel](#deploy-to-vercel)**: no server to manage, with Neon and Upstash for the database
  and Redis. Needs a Vercel Pro plan.

Self-hosted Featul has no billing: every workspace gets the full Professional plan.

## Your own server

Run Featul on your own server with one command:

```bash
curl -fsSL https://raw.githubusercontent.com/usefeatul/featul/main/selfhost/install.sh | bash
```

The installer checks for Docker, downloads Featul into `./featul`, asks for your domain,
generates every secret into `selfhost/.env`, and starts the stack. When it finishes, open
`https://<your domain>/auth/signup` and create your account.

### Before you start

- A Linux server with Docker and Docker Compose v2, at least 2 CPUs and 4 GB of RAM plus 4 GB
  of swap (building the image is the heaviest step), and ports 80 and 443 open.
- A domain with two DNS records pointing at the server:

  | Type | Name            | Value          |
  | ---- | --------------- | -------------- |
  | A    | `feedback.acme.com`   | server IP |
  | A    | `*.feedback.acme.com` | server IP |

  The app runs at `https://feedback.acme.com`. Each workspace's public board, roadmap, and
  changelog runs at `https://<workspace>.feedback.acme.com`. Caddy issues HTTPS certificates
  automatically on first visit.

### What runs

| Service      | Purpose                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| `app`        | The Featul app (Next.js)                                                |
| `postgres`   | Database, stored in the `postgres` volume                               |
| `neon-proxy` | Lets the app use the same Postgres driver as Featul Cloud               |
| `redis`, `redis-http` | Rate limiting                                                  |
| `migrate`    | Creates and upgrades the database schema, then exits                    |
| `caddy`      | HTTPS for the app, workspace subdomains, and verified custom domains    |
| `cron`       | Publishes scheduled changelog posts and retries webhooks                |

### Configuration

Everything lives in `selfhost/.env` (see [`.env.example`](.env.example)). After editing it,
apply the change with:

```bash
cd featul/selfhost && docker compose up -d --build
```

- **Email**: set `RESEND_API_KEY` and `RESEND_FROM` to send sign-in codes, invites, and
  notifications. Without them, emails are printed to the logs instead, so you can still
  sign up: `docker compose logs app | grep -A3 email:self-hosted`.
- **Google / GitHub sign-in**: set the client ID and secret. Callback URL:
  `https://<domain>/api/auth/callback/google` (or `/github`).
- **File uploads**: point the `R2_*` settings at Cloudflare R2 or any S3-compatible store
  (set `R2_ENDPOINT` for MinIO, Backblaze B2, and others). Without them, image uploads are off.
- **AI features**: set `OPENROUTER_API_KEY`.

### Upgrading

Run the installer again. It pulls the latest code, keeps your `.env`, rebuilds, and the
`migrate` service applies any new database migrations before the app starts.

### Backups

```bash
cd featul/selfhost
docker compose exec -T postgres pg_dump -U featul featul | gzip > featul-$(date +%F).sql.gz
```

### Unattended install

```bash
FEATUL_DOMAIN=feedback.acme.com ACME_EMAIL=ops@acme.com RESEND_API_KEY=re_... \
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/usefeatul/featul/main/selfhost/install.sh)"
```

`FEATUL_DIR` changes the install directory. `FEATUL_BRANCH` installs another branch.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fusefeatul%2Ffeatul&root-directory=apps%2Fapp&project-name=featul&repository-name=featul&env=FEATUL_DOMAIN%2CBETTER_AUTH_SECRET%2CCRON_SECRET&envDescription=Needs%20Vercel%20Pro.%20FEATUL_DOMAIN%20is%20where%20Featul%20will%20live%2C%20e.g.%20feedback.yourcompany.com.%20Generate%20BETTER_AUTH_SECRET%20and%20CRON_SECRET%20with%3A%20openssl%20rand%20-hex%2032&envLink=https%3A%2F%2Fgithub.com%2Fusefeatul%2Ffeatul%2Fblob%2Fmain%2Fselfhost%2FREADME.md%23deploy-to-vercel&stores=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22integrationSlug%22%3A%22upstash%22%2C%22productSlug%22%3A%22upstash-kv%22%7D%5D)

You need a **Vercel Pro** plan: Featul publishes scheduled changelog posts every minute, and
Vercel's free Hobby plan rejects deployments with cron jobs that run more than once a day.

The button copies Featul into your GitHub account, creates a Vercel project for `apps/app`,
and adds a Neon database and Upstash Redis. It asks for three values:

| Variable             | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| `FEATUL_DOMAIN`      | Where Featul will live, e.g. `feedback.acme.com`                       |
| `BETTER_AUTH_SECRET` | A random secret: `openssl rand -hex 32`                                |
| `CRON_SECRET`        | Another random secret: `openssl rand -hex 32`                          |

Every production deploy creates or upgrades the database before the build, so there is no
separate setup step.

### Add your domain

In the Vercel project, open **Settings → Domains** and add both:

- `feedback.acme.com`, the app
- `*.feedback.acme.com`, the workspaces' public boards, roadmaps, and changelogs

Vercel only issues certificates for wildcard domains whose nameservers point at Vercel, so move
the domain's DNS to Vercel (it shows the nameservers when you add the wildcard). Then
redeploy, and create your account at `https://feedback.acme.com/auth/signup`.

### Optional settings

Add these under **Settings → Environment Variables**, then redeploy:

- **Email**: `RESEND_API_KEY` and `RESEND_FROM`. Without them, sign-in codes and invite links
  are written to the project's runtime logs instead of being sent.
- **Google / GitHub sign-in**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, or
  `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Callback URL:
  `https://<domain>/api/auth/callback/google` (or `/github`).
- **File uploads**: the `R2_*` settings from [`.env.example`](.env.example).
- **AI features**: `OPENROUTER_API_KEY`.

### Upgrading

The button made a copy of the repository in your account, not a fork, so pull new releases
into it yourself:

```bash
git pull https://github.com/usefeatul/featul.git main
git push
```

Vercel redeploys and upgrades the database automatically.

## Limitations

- HTTPS on a real domain is required. Production builds refuse plain-HTTP and `localhost`
  origins for cookie and CORS safety. To try Featul locally, use the development setup in the
  main [README](../README.md).
- `FEATUL_DOMAIN` is built into the app, so changing it needs a rebuild (`up -d --build`, or a
  redeploy on Vercel).
- Custom domains for workspaces are verified through Vercel on Featul Cloud and aren't
  available self-hosted yet.
