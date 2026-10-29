# Self-hosting Featul

Run Featul on your own server with one command:

```bash
curl -fsSL https://raw.githubusercontent.com/usefeatul/featul/main/selfhost/install.sh | bash
```

The installer checks for Docker, downloads Featul into `./featul`, asks for your domain,
generates every secret into `selfhost/.env`, and starts the stack. When it finishes, open
`https://<your domain>/auth/signup` and create your account.

Self-hosted Featul has no billing: every workspace gets the full Professional plan.

## Before you start

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

## What runs

| Service      | Purpose                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| `app`        | The Featul app (Next.js)                                                |
| `postgres`   | Database, stored in the `postgres` volume                               |
| `neon-proxy` | Lets the app use the same Postgres driver as Featul Cloud               |
| `redis`, `redis-http` | Rate limiting                                                  |
| `migrate`    | Creates and upgrades the database schema, then exits                    |
| `caddy`      | HTTPS for the app, workspace subdomains, and verified custom domains    |
| `cron`       | Publishes scheduled changelog posts and retries webhooks                |

## Configuration

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

## Upgrading

Run the installer again. It pulls the latest code, keeps your `.env`, rebuilds, and the
`migrate` service applies any new database migrations before the app starts.

## Backups

```bash
cd featul/selfhost
docker compose exec -T postgres pg_dump -U featul featul | gzip > featul-$(date +%F).sql.gz
```

## Unattended install

```bash
FEATUL_DOMAIN=feedback.acme.com ACME_EMAIL=ops@acme.com RESEND_API_KEY=re_... \
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/usefeatul/featul/main/selfhost/install.sh)"
```

`FEATUL_DIR` changes the install directory. `FEATUL_BRANCH` installs another branch.

## Limitations

- HTTPS on a real domain is required. Production builds refuse plain-HTTP and `localhost`
  origins for cookie and CORS safety. To try Featul locally, use the development setup in the
  main [README](../README.md).
- `FEATUL_DOMAIN` is built into the app, so changing it needs a rebuild (`up -d --build`).
- Custom domains for workspaces are verified through Vercel on Featul Cloud and aren't
  available self-hosted yet.
