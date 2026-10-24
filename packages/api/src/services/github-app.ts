import { createHmac, createPrivateKey, createSign, timingSafeEqual, type KeyObject } from "node:crypto";
import { HTTPException } from "hono/http-exception";

const API = "https://api.github.com";
const API_VERSION = "2022-11-28";

function readEnv(name: string) {
  return String(process.env[name] || "").trim();
}

function requireEnv(name: string) {
  const value = readEnv(name);
  if (!value) throw new HTTPException(500, { message: `Missing required env: ${name}` });
  return value;
}

/** Accepts a PEM with real or escaped newlines, optionally quoted or base64-encoded. */
function loadPrivateKey(): KeyObject {
  let raw = requireEnv("GITHUB_APP_PRIVATE_KEY");
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) raw = raw.slice(1, -1);
  if (raw.includes("\\n")) raw = raw.replace(/\\n/g, "\n");
  if (!raw.includes("BEGIN ") && /^[A-Za-z0-9+/=\s]+$/.test(raw)) {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    if (decoded.includes("BEGIN ")) raw = decoded;
  }
  try {
    return createPrivateKey({ key: raw.replace(/\r\n/g, "\n").trim(), format: "pem" });
  } catch {
    throw new HTTPException(500, {
      message: "GITHUB_APP_PRIVATE_KEY isn't a valid PEM key. Download one from the GitHub App settings.",
    });
  }
}

export function isGithubAppConfigured() {
  return Boolean(
    readEnv("GITHUB_APP_ID") &&
      readEnv("GITHUB_APP_PRIVATE_KEY") &&
      readEnv("GITHUB_APP_SLUG") &&
      readEnv("GITHUB_APP_CLIENT_ID") &&
      readEnv("GITHUB_APP_CLIENT_SECRET"),
  );
}

function appJwt() {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iat: now - 60, exp: now + 540, iss: requireEnv("GITHUB_APP_ID") })}`;
  const signature = createSign("RSA-SHA256").update(body).end().sign(loadPrivateKey()).toString("base64url");
  return `${body}.${signature}`;
}

async function github<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": API_VERSION,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new HTTPException(res.status === 404 ? 404 : 502, { message: `GitHub request failed (${res.status})` });
  }
  return (await res.json()) as T;
}

export type GithubInstallation = { id: string; accountLogin: string; accountType: string };

export async function getInstallation(installationId: string): Promise<GithubInstallation> {
  const data = await github<{ id: number; account?: { login?: string; type?: string } }>(
    `/app/installations/${encodeURIComponent(installationId)}`,
    appJwt(),
  );
  return { id: String(data.id), accountLogin: String(data.account?.login ?? ""), accountType: String(data.account?.type ?? "") };
}

/** Short-lived (1 hour) token limited to the repos the installation was granted, read-only contents. */
export async function createInstallationToken(installationId: string): Promise<string> {
  const data = await github<{ token?: string }>(
    `/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
    appJwt(),
    {
      method: "POST",
      body: JSON.stringify({ permissions: { contents: "read", metadata: "read" } }),
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!data.token) throw new HTTPException(502, { message: "GitHub didn't return an installation token" });
  return data.token;
}

export type GithubRepo = { fullName: string; private: boolean; description: string | null; pushedAt: string | null };

/** Repos granted to the installation, limited to `allowed` (lowercase `owner/name`) when given. */
export async function listInstallationRepos(installationId: string, allowed?: string[] | null): Promise<GithubRepo[]> {
  const allow = allowed ? new Set(allowed) : null;
  const token = await createInstallationToken(installationId);
  const repos: GithubRepo[] = [];
  for (let page = 1; page <= 5; page++) {
    const data = await github<{
      repositories?: Array<{ full_name: string; private: boolean; description: string | null; pushed_at: string | null }>;
    }>(`/installation/repositories?per_page=100&page=${page}`, token);
    const batch = data.repositories ?? [];
    repos.push(...batch.map((r) => ({ fullName: r.full_name, private: r.private, description: r.description, pushedAt: r.pushed_at })));
    if (batch.length < 100) break;
  }
  return repos
    .filter((r) => !allow || allow.has(r.fullName.toLowerCase()))
    .sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""));
}

export function githubAppInstallUrl(state: string) {
  const url = new URL(`https://github.com/apps/${requireEnv("GITHUB_APP_SLUG")}/installations/new`);
  url.searchParams.set("state", state);
  return url.toString();
}

/**
 * Proves the person finishing the install can actually access `installationId`, and returns the
 * repos in it they can access (lowercase `owner/name`). The callback's installation_id is just a
 * query parameter, and an installation is listed for anyone with access to any one of its repos,
 * while its token reads all of them; scans are kept to the returned repos.
 * Requires "Request user authorization (OAuth) during installation" on the GitHub App.
 */
export async function verifyInstallerAccess(code: string, installationId: string): Promise<string[]> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireEnv("GITHUB_APP_CLIENT_ID"),
      client_secret: requireEnv("GITHUB_APP_CLIENT_SECRET"),
      code,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string };
  if (!res.ok || !data.access_token) throw new HTTPException(403, { message: "GitHub authorization failed" });
  const userToken = data.access_token;
  try {
    let found = false;
    for (let page = 1; page <= 10 && !found; page++) {
      const list = await github<{ installations?: Array<{ id: number }> }>(
        `/user/installations?per_page=100&page=${page}`,
        userToken,
      );
      const batch = list.installations ?? [];
      found = batch.some((i) => String(i.id) === installationId);
      if (batch.length < 100) break;
    }
    if (!found) throw new HTTPException(403, { message: "You don't have access to that GitHub installation" });
    const repos: string[] = [];
    for (let page = 1; page <= 10; page++) {
      const list = await github<{ repositories?: Array<{ full_name: string }> }>(
        `/user/installations/${encodeURIComponent(installationId)}/repositories?per_page=100&page=${page}`,
        userToken,
      );
      const batch = list.repositories ?? [];
      repos.push(...batch.map((r) => r.full_name.toLowerCase()));
      if (batch.length < 100) break;
    }
    return repos;
  } finally {
    // The user token was only needed for this check; revoke it right away.
    await fetch(`${API}/applications/${encodeURIComponent(requireEnv("GITHUB_APP_CLIENT_ID"))}/token`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`${requireEnv("GITHUB_APP_CLIENT_ID")}:${requireEnv("GITHUB_APP_CLIENT_SECRET")}`).toString("base64")}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: userToken }),
    }).catch(() => {});
  }
}

/** Signed install state: ties the GitHub round trip to one user, workspace and return page. */
export type GithubSetupState = { workspaceSlug: string; userId: string; returnTo: string; issuedAt: number };

function stateSecret() {
  // Production needs its own key; reusing the auth secret is a local-dev convenience only.
  const secret =
    readEnv("GITHUB_SETUP_STATE_SECRET") ||
    (process.env.NODE_ENV === "production" ? "" : readEnv("BETTER_AUTH_SECRET"));
  if (!secret) throw new HTTPException(500, { message: "Missing GITHUB_SETUP_STATE_SECRET" });
  return secret;
}

const sign = (payload: string) => createHmac("sha256", stateSecret()).update(payload).digest("base64url");

export function createSetupState(input: Omit<GithubSetupState, "issuedAt">) {
  const payload = Buffer.from(JSON.stringify({ ...input, issuedAt: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySetupState(state: string): GithubSetupState {
  const [payload = "", signature = ""] = state.split(".");
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (!payload || expected.length !== given.length || !timingSafeEqual(expected, given)) {
    throw new HTTPException(400, { message: "Invalid GitHub setup state" });
  }
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GithubSetupState;
  if (!parsed.workspaceSlug || !parsed.userId || Date.now() - Number(parsed.issuedAt) > 30 * 60 * 1000) {
    throw new HTTPException(400, { message: "GitHub setup expired. Please try again." });
  }
  // Only same-app relative paths, so the state can't be used as an open redirect.
  if (!/^\/workspaces\/[^/]+\//.test(parsed.returnTo) || parsed.returnTo.startsWith("//")) {
    parsed.returnTo = `/workspaces/${parsed.workspaceSlug}/settings/help`;
  }
  return parsed;
}
