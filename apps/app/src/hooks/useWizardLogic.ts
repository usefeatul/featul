import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import {
  workspaceSchema,
  isDomainValid,
  cleanSlug,
  slugifyFromName,
  isReservedWorkspaceSlug,
} from "../lib/validators";

function extractNameFromDomain(domain: string): string {
  const part = domain.split(".")[0]?.trim() || "";
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

export function useWizardLogic() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const [nameDirty, setNameDirty] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugLocked, setSlugLocked] = useState<string | null>(null);

  const [now, setNow] = useState<Date>(new Date());
  const [isCreating, setIsCreating] = useState(false);

  const domainValid = useMemo(() => isDomainValid(domain), [domain]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof Intl === "undefined") return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setTimezone(detected);
  }, []);

  useEffect(() => {
    if (nameDirty || !domain) return;
    const extracted = extractNameFromDomain(domain);
    if (extracted) setName(extracted);
  }, [domain, nameDirty]);

  useEffect(() => {
    if (slugDirty) return;
    setSlug(slugifyFromName(name));
  }, [name, slugDirty]);

  useEffect(() => {
    const initialLocked = (searchParams?.get("slug") || "").trim().toLowerCase();
    let mounted = true;

    (async () => {
      try {
        const res = await client.reservation.claimOnSignup.$get();
        const data = await res.json();
        const locked = String(data?.slugLocked || initialLocked || "").trim().toLowerCase();

        if (locked && mounted) {
          setSlugLocked(locked);
          setSlugDirty(true);
          setSlug(locked);
          setSlugAvailable(true);
          setSlugChecking(false);
        }
      } catch {
        /* ignore */
      }
    })();

    return () => { mounted = false; };
  }, [searchParams]);

  useEffect(() => {
    if (!slug || slug.length < 5) {
      setSlugAvailable(null);
      setSlugChecking(false);
      return;
    }

    if (slugLocked) {
      setSlugAvailable(true);
      setSlugChecking(false);
      return;
    }

    if (isReservedWorkspaceSlug(slug)) {
      setSlugAvailable(false);
      setSlugChecking(false);
      return;
    }

    setSlugChecking(true);
    setSlugAvailable(null);

    const id = setTimeout(async () => {
      try {
        const res = await client.workspace.checkSlug.$post({ slug });
        const data = await res.json();
        setSlugAvailable(Boolean(data?.available));
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);

    return () => clearTimeout(id);
  }, [slug, slugLocked]);

  const create = useCallback(async () => {
    setIsCreating(true);

    try {
      const parsed = workspaceSchema.safeParse({
        name: name.trim(),
        domain: domain.trim(),
        slug: slug.trim(),
        timezone,
      });

      if (!parsed.success) {
        toast.error("Invalid workspace details");
        return;
      }

      const res = await client.workspace.create.$post(parsed.data);
      if (!res.ok) {
        await res.json();
        toast.error("Failed to create workspace");
        return;
      }

      const data = await res.json();
      toast.success("Workspace created");

      const createdSlug = data?.workspace?.slug || slug;

      queryClient.setQueryData(
        ["workspaces"],
        (prev: { workspaces: { id: string; slug: string; name: string }[] } | undefined) => {
          if (!prev) return prev;
          const list = Array.isArray(prev) ? prev : prev.workspaces || [];
          const next = [...list, data?.workspace].filter(Boolean);
          return prev.workspaces ? { ...prev, workspaces: next } : next;
        }
      );

      if (data?.workspace) {
        queryClient.setQueryData(["workspace", createdSlug], data.workspace);
      }

      router.push(`/workspaces/${createdSlug}`);
    } catch (e: unknown) {
      const message = (e as { message?: string })?.message || "Failed to create workspace";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }, [name, domain, slug, timezone, queryClient, router]);

  const handleNameChange = useCallback((v: string) => {
    setNameDirty(true);
    setName(v);
  }, []);

  const handleSlugChange = useCallback((v: string) => {
    setSlugDirty(true);
    setSlug(cleanSlug(v));
  }, []);

  return {
    name,
    setName,
    domain,
    setDomain,
    slug,
    setSlug,
    setSlugDirty,
    slugChecking,
    slugAvailable,
    slugLocked,
    timezone,
    setTimezone,
    now,
    isCreating,
    domainValid,
    create,
    handleNameChange,
    handleSlugChange,
  };
}
