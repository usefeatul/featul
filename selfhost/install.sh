#!/usr/bin/env bash
# Self-host Featul in one command:
#
#   curl -fsSL https://raw.githubusercontent.com/usefeatul/featul/main/selfhost/install.sh | bash
#
# Installs into ./featul (override with FEATUL_DIR). Run it again to upgrade: it pulls the
# latest code, keeps your .env, and rebuilds. For unattended installs set FEATUL_DOMAIN and
# ACME_EMAIL in the environment.
set -euo pipefail

REPO_URL="${FEATUL_REPO:-https://github.com/usefeatul/featul.git}"
BRANCH="${FEATUL_BRANCH:-main}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
fail() { printf '\033[31mError:\033[0m %s\n' "$*" >&2; exit 1; }

# Prompts read from the terminal, since stdin is this script when piped from curl.
ask() {
  local prompt="$1" default="${2:-}" answer=""
  [ -r /dev/tty ] || fail "No terminal to ask \"$prompt\". Set it in the environment instead (see selfhost/README.md)."
  if [ -n "$default" ]; then printf '%s [%s]: ' "$prompt" "$default" > /dev/tty; else printf '%s: ' "$prompt" > /dev/tty; fi
  read -r answer < /dev/tty
  printf '%s' "${answer:-$default}"
}

secret() { openssl rand -hex 32; }

bold "Featul self-hosted installer"

for cmd in git openssl curl; do
  command -v "$cmd" > /dev/null || fail "$cmd is required."
done
command -v docker > /dev/null || fail "Docker is required: https://docs.docker.com/engine/install/"
docker compose version > /dev/null 2>&1 || fail "Docker Compose v2 is required (the \`docker compose\` plugin)."
docker info > /dev/null 2>&1 || fail "Docker is installed but not running, or this user can't reach it (try sudo, or add yourself to the docker group)."

# Use the checkout this script lives in, or clone/update one.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2> /dev/null && pwd || true)"
if [ -n "$script_dir" ] && [ -f "$script_dir/docker-compose.yml" ] && [ -f "$script_dir/../Dockerfile" ]; then
  root="$(cd "$script_dir/.." && pwd)"
  if [ -d "$root/.git" ]; then
    bold "Updating $root"
    git -C "$root" pull --ff-only || info "Could not fast-forward (local changes?), building the code as it is."
  fi
else
  root="${FEATUL_DIR:-$PWD/featul}"
  if [ -d "$root/.git" ]; then
    bold "Updating $root"
    git -C "$root" pull --ff-only origin "$BRANCH"
  else
    bold "Downloading Featul into $root"
    git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$root"
  fi
fi
cd "$root/selfhost"

if [ -f .env ]; then
  bold "Keeping existing selfhost/.env"
  domain="$(grep -E '^FEATUL_DOMAIN=' .env | cut -d= -f2-)"
else
  domain="${FEATUL_DOMAIN:-}"
  email="${ACME_EMAIL:-}"
  unattended="${domain:+yes}"
  if [ -z "$domain" ]; then
    echo
    info "Featul needs a domain with HTTPS. The app runs at https://<domain> and each"
    info "workspace at https://<workspace>.<domain>. Point both of these DNS records at"
    info "this server before continuing:"
    info "  A  <domain>    →  this server's IP"
    info "  A  *.<domain>  →  this server's IP"
    echo
    domain="$(ask "Domain (e.g. feedback.yourcompany.com)")"
  fi
  domain="$(printf '%s' "$domain" | tr '[:upper:]' '[:lower:]' | sed -E 's#^https?://##; s#/.*$##')"
  [[ "$domain" == *.* ]] || fail "\"$domain\" is not a domain name."
  [ -n "$email" ] || email="$(ask "Email for Let's Encrypt certificate notices")"
  [[ "$email" == *@* ]] || fail "\"$email\" is not an email address."

  resend_key="${RESEND_API_KEY:-}"
  if [ -z "$resend_key" ] && [ -z "$unattended" ] && [ -r /dev/tty ]; then
    resend_key="$(ask "Resend API key for sending email (optional, press Enter to skip)")"
  fi

  sed \
    -e "s#^FEATUL_DOMAIN=.*#FEATUL_DOMAIN=$domain#" \
    -e "s#^ACME_EMAIL=.*#ACME_EMAIL=$email#" \
    -e "s#^POSTGRES_PASSWORD=.*#POSTGRES_PASSWORD=$(secret)#" \
    -e "s#^REDIS_TOKEN=.*#REDIS_TOKEN=$(secret)#" \
    -e "s#^BETTER_AUTH_SECRET=.*#BETTER_AUTH_SECRET=$(secret)#" \
    -e "s#^CRON_SECRET=.*#CRON_SECRET=$(secret)#" \
    -e "s#^NOTRA_CREDENTIALS_ENCRYPTION_KEY=.*#NOTRA_CREDENTIALS_ENCRYPTION_KEY=$(secret)#" \
    -e "s#^RESEND_API_KEY=.*#RESEND_API_KEY=$resend_key#" \
    -e "s#^RESEND_FROM=.*#RESEND_FROM=\"Featul <feedback@$domain>\"#" \
    .env.example > .env
  chmod 600 .env
  bold "Wrote selfhost/.env with fresh secrets"
fi

bold "Building and starting Featul (the first build takes several minutes)"
docker compose up -d --build \
  || fail "Featul did not start. Check: cd $root/selfhost && docker compose logs migrate app"

bold "Waiting for the app to come up"
for _ in $(seq 1 90); do
  if docker compose exec -T app node -e "fetch('http://localhost:3000/auth/signin').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))" > /dev/null 2>&1; then
    echo
    bold "Featul is running at https://$domain"
    info "Create your account at https://$domain/auth/signup"
    if ! grep -qE '^RESEND_API_KEY=.+' .env; then
      info "No email provider set: find sign-up codes with"
      info "  cd $root/selfhost && docker compose logs app | grep -A3 email:self-hosted"
    fi
    info "Upgrade later by running this installer again."
    exit 0
  fi
  sleep 5
done

fail "The app did not become ready in time. Check: cd $root/selfhost && docker compose logs migrate app"
