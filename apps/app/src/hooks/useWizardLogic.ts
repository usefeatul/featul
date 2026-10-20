import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import {
  getWorkspaceSchema,
  isDomainValid,
  cleanSlug,
  slugifyFromName,
  isReservedWorkspaceSlug,
} from "../lib/validators";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
import { markPendingWelcomeTour } from "@/lib/welcome/tour";

/** Capitalizes the first DNS label of a domain as a workspace name. */
function extractNameFromDomain(domain: string): string {
  const part = domain.split(".")[0]?.trim() || "";
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

type UseWizardLogicOptions = {
  /** True when creating the user's first workspace (from /start). */
  isFirstWorkspace?: boolean;
};

/** Workspace create wizard: name, slug, domain, timezone, and submit. Marks the welcome tour pending on first workspace. */
export function useWizardLogic(_options: UseWizardLogicOptions = {}) {
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
  const [isAppCreator, setIsAppCreator] = useState(false);

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
    let mounted = true;

    (async () => {
      try {
        const res = await client.workspace.creator.$get();
        const data = await res.json();
        if (mounted) setIsAppCreator(Boolean(data?.isCreator));
      } catch {
        /* ignore */
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

    if (isReservedWorkspaceSlug(slug) && !isAppCreator) {
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
  }, [slug, slugLocked, isAppCreator]);

  /** `helpImport` sends the new workspace to the help center draft scan instead of the dashboard. */
  const create = useCallback(async (options?: { helpImport?: { repo: string } | null }) => {
    setIsCreating(true);

    try {
      const parsed = getWorkspaceSchema({ allowReserved: isAppCreator }).safeParse({
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
      captureAnalyticsEvent(analyticsEvents.workspaceCreated, {
        workspace_id: data?.workspace?.id ? String(data.workspace.id) : undefined,
        workspace_slug: createdSlug,
        timezone,
        has_reserved_slug: Boolean(slugLocked),
        creation_source: slugLocked ? "reservation" : "wizard",
      });

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

      const isFirstWorkspace = Boolean(data?.isFirstWorkspace);
      // The gate never opens the tour on the help import page, so it starts on whichever page
      // comes next, not over the scan.
      if (isFirstWorkspace) {
        markPendingWelcomeTour();
      }

      if (options?.helpImport) {
        const params = new URLSearchParams({ site: domain.trim(), start: "1", onboarding: "1" });
        if (options.helpImport.repo.trim()) params.set("repo", options.helpImport.repo.trim());
        router.push(`/workspaces/${createdSlug}/help/import?${params.toString()}`);
        return;
      }
      router.push(`/workspaces/${createdSlug}${isFirstWorkspace ? "?welcome=1" : ""}`);
    } catch (e: unknown) {
      const message = (e as { message?: string })?.message || "Failed to create workspace";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }, [name, domain, slug, timezone, queryClient, router, slugLocked, isAppCreator]);

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
    isAppCreator,
  };
}
