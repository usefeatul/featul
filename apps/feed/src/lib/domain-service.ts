"use client";

import { client } from "@oreilla/api/client";
import type { DomainInfo } from "../types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function useDomain(slug: string, initial?: { info: DomainInfo | null; plan: string; defaultDomain: string }) {
  return useQuery({
    queryKey: ["domain", slug],
    queryFn: async () => {
      const res = await client.workspace.domainInfo.$get({ slug });
      const data = await safeJson<any>(res);
      return {
        info: (data?.domain || null) as DomainInfo,
        plan: (data?.plan || "free") as string,
        defaultDomain: (data?.defaultDomain || "") as string,
      };
    },
    initialData: initial,
    staleTime: 300000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export async function createDomain(
  slug: string,
  baseDomain: string
): Promise<{ ok: boolean; message?: string; host?: string; records?: { cname?: { name?: string; value?: string }; txt?: { name?: string; value?: string } } }> {
  const res = await client.workspace.createDomain.$post({
    slug,
    domain: `https://feedback.${baseDomain.trim()}`,
  });
  const data = await safeJson<any>(res);
  const message = (data as { message?: string })?.message;
  const host = (data as { host?: string })?.host;
  const records = (data as { records?: { cname?: { name?: string; value?: string }; txt?: { name?: string; value?: string } } })?.records;
  return { ok: res.ok, message, host, records };
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

type UseDomainActionsOptions = {
  slug: string;
  info: DomainInfo;
  canUse: boolean;
  canEditDomain: boolean;
  onCreated?: () => void;
};

export function useDomainActions({ slug, info, canUse, canEditDomain, onCreated }: UseDomainActionsOptions) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (base: string) => createDomain(slug, base),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || "Failed to add domain");
        return;
      }
      toast.success("Domain added. Configure DNS and verify.");
      onCreated?.();
      try {
        queryClient.setQueryData(["domain", slug], (prev: any) => {
          const nextInfo = {
            id: String(prev?.info?.id || ""),
            host: String(result.host || prev?.info?.host || ""),
            cnameName: String(result.records?.cname?.name || prev?.info?.cnameName || ""),
            cnameTarget: String(result.records?.cname?.value || prev?.info?.cnameTarget || "origin.oreilla.com"),
            txtName: String(result.records?.txt?.name || prev?.info?.txtName || ""),
            txtValue: String(result.records?.txt?.value || prev?.info?.txtValue || ""),
            status: "pending" as const,
          }
          return {
            ...(prev || {}),
            info: nextInfo,
          }
        })
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["domain", slug] });
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message || "Failed to add domain");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyDomain(slug),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || "Verify failed");
      } else if (result.status === "verified") {
        toast.success("Domain verified");
        if (info?.host) {
          type WsDetails = {
            id: string;
            name: string;
            slug: string;
            logo?: string | null;
            domain?: string | null;
            customDomain?: string | null;
          } | null;
          queryClient.setQueryData<WsDetails>(["workspace", slug], (prev) =>
            prev ? { ...prev, customDomain: info.host } : prev
          );
        }
      } else {
        toast.info("Records not found yet. Still pending.");
      }
      queryClient.invalidateQueries({ queryKey: ["domain", slug] });
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message || "Failed to verify domain");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDomain(slug),
    onSuccess: (r) => {
      if (!r.ok) {
        toast.error(r.message || "Delete failed");
        return;
      }
      toast.success("Domain deleted");
      try {
        queryClient.setQueryData(["domain", slug], (prev: any) => ({ ...(prev || {}), info: null }))
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["domain", slug] });
    },
    onError: (e: unknown) => {
      toast.error((e as Error)?.message || "Delete failed");
    },
  });

  const handleCreate = (base: string) => {
    if (!canUse) {
      toast.error("Upgrade to Starter or Professional to use a custom domain");
      return;
    }
    if (!canEditDomain) {
      toast.error("You don’t have permission to manage domain");
      return;
    }
    const v = (base || "").trim();
    if (!v) {
      toast.error("Enter a domain");
      return;
    }
    createMutation.mutate(v);
  };

  const handleVerify = () => {
    if (!canEditDomain) {
      toast.error("You don’t have permission to verify domain");
      return;
    }
    verifyMutation.mutate();
  };

  const handleDelete = () => {
    if (!canEditDomain) {
      toast.error("You don’t have permission to delete domain");
      return;
    }
    deleteMutation.mutate();
  };

  return { createMutation, verifyMutation, deleteMutation, handleCreate, handleVerify, handleDelete };
}
