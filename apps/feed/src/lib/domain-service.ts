import { client } from "@feedgot/api/client";
import type { DomainInfo } from "../types/domain";

async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function loadDomain(
  slug: string
): Promise<{ info: DomainInfo; plan: string; defaultDomain: string }> {
  const res = await client.workspace.domainInfo.$get({ slug });
  const data = await safeJson(res);
  return {
    info: (data as { domain?: DomainInfo })?.domain || null,
    plan: (data as { plan?: string })?.plan || "free",
    defaultDomain: (data as { defaultDomain?: string })?.defaultDomain || "",
  };
}

export async function createDomain(
  slug: string,
  baseDomain: string
): Promise<{ ok: boolean; message?: string }> {
  const res = await client.workspace.createDomain.$post({
    slug,
    domain: `https://feedback.${baseDomain.trim()}`,
  });
  const data = await safeJson(res);
  const message = (data as { message?: string })?.message;
  return { ok: res.ok, message };
}

export async function verifyDomain(
  slug: string
): Promise<{
  ok: boolean;
  status?: string;
  cnameValid?: boolean;
  txtValid?: boolean;
  message?: string;
}> {
  const res = await client.workspace.verifyDomain.$post({
    slug,
    checkDns: true,
  });
  const data = await safeJson(res);
  const status = (data as { status?: string })?.status;
  const cnameValid = (data as { cnameValid?: boolean })?.cnameValid;
  const txtValid = (data as { txtValid?: boolean })?.txtValid;
  return { ok: res.ok, status, cnameValid, txtValid };
}

export async function deleteDomain(
  slug: string
): Promise<{ ok: boolean; message?: string }> {
  const res = await client.workspace.deleteDomain.$post({ slug });
  const data = await safeJson(res);
  const message = (data as { message?: string })?.message;
  return { ok: res.ok, message };
}
