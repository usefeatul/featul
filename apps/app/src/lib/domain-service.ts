"use client";

import { client } from "@featul/api/client";
import type { DomainInfo } from "../types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isDomainValid, suggestDomainFix } from "./validators";

async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface DomainInfoResponse {
  domain?: DomainInfo;
  plan?: string;
  defaultDomain?: string;
}

export function useDomain(slug: string, initial?: { info: DomainInfo | null; plan: string; defaultDomain: string }) {
  return useQuery({
    queryKey: ["domain", slug],
    queryFn: async () => {
      const res = await client.workspace.domainInfo.$get({ slug });
      const data = await safeJson<DomainInfoResponse>(res);
      return {
        info: data?.domain || null,
        plan: data?.plan || "free",
        defaultDomain: data?.defaultDomain || "",
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

interface CreateDomainApiResponse {
  message?: string;
  host?: string;
  records?: {
    cname?: { name?: string; value?: string };
    txt?: { name?: string; value?: string };
  };
}

export async function createDomain(
  slug: string,
  baseDomain: string
): Promise<{ ok: boolean; message?: string; host?: string; records?: CreateDomainApiResponse["records"] }> {
  const res = await client.workspace.createDomain.$post({
    slug,
    domain: `https://feedback.${baseDomain.trim()}`,
  });
  const data = await safeJson<CreateDomainApiResponse>(res);
  return {
    ok: res.ok,
    message: data?.message,
    host: data?.host,
    records: data?.records
  };
}

interface VerifyDomainApiResponse {
  status?: string;
  cnameValid?: boolean;
  txtValid?: boolean;
  message?: string;
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
  const data = await safeJson<VerifyDomainApiResponse>(res);
  return {
    ok: res.ok,
    status: data?.status,
    cnameValid: data?.cnameValid,
    txtValid: data?.txtValid
  };
}

interface DeleteDomainApiResponse {
  message?: string;
}

export async function deleteDomain(
  slug: string
): Promise<{ ok: boolean; message?: string }> {
  const res = await client.workspace.deleteDomain.$post({ slug });
  const data = await safeJson<DeleteDomainApiResponse>(res);
  return { ok: res.ok, message: data?.message };
}

type UseDomainActionsOptions = {
  slug: string;
  info: DomainInfo;
  canUse: boolean;
  canEditDomain: boolean;
  onCreated?: () => void;
};

type UseDomainData = {
  info: DomainInfo;
  plan: string;
  defaultDomain: string;
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
        queryClient.setQueryData<UseDomainData>(["domain", slug], (prev) => {
          if (!prev) return prev;
          const nextInfo: DomainInfo = {
            id: String(prev.info?.id || ""),
            host: String(result.host || prev.info?.host || ""),
            cnameName: String(result.records?.cname?.name || prev.info?.cnameName || ""),
            cnameTarget: String(result.records?.cname?.value || prev.info?.cnameTarget || "origin.featul.com"),
            txtName: String(result.records?.txt?.name || prev.info?.txtName || ""),
            txtValue: String(result.records?.txt?.value || prev.info?.txtValue || ""),
            status: "pending",
          };
          return {
            ...prev,
            info: nextInfo,
          };
        })
      } catch { 
        // error setting query data
      }
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
        queryClient.setQueryData<UseDomainData>(["domain", slug], (prev) =>
          prev ? { ...prev, info: null } : undefined
        )
      } catch {
        // error setting query data
      }
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
    const normalized = v.toLowerCase();
    if (!isDomainValid(normalized)) {
      const suggestion = suggestDomainFix(normalized);
      toast.error(
        suggestion
          ? `Invalid domain. Did you mean ${suggestion}?`
          : "Enter a valid domain (example.com)"
      );
      return;
    }
    createMutation.mutate(normalized);
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
