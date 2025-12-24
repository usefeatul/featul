import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@oreilla/api/client";
import {
  workspaceSchema,
  isDomainValid,
  cleanSlug,
  slugifyFromName,
} from "../lib/validators";

export function useWizardLogic() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Form State
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState<string>("UTC");

  // Slug State
  const [slugDirty, setSlugDirty] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugLocked, setSlugLocked] = useState<string | null>(null);

  // Other State
  const [now, setNow] = useState<Date>(new Date());
  const [isCreating, setIsCreating] = useState(false);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof Intl === "undefined") return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setTimezone(detected);
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (slugDirty) return;
    const s = slugifyFromName(name);
    setSlug(s);
  }, [name, slugDirty]);

  // Check for reserved slug
  useEffect(() => {
    const initialLocked = (searchParams?.get("slug") || "")
      .trim()
      .toLowerCase();
    let mounted = true;

    const checkReservation = async () => {
      try {
        const res = await client.reservation.claimOnSignup.$get();
        const data = await res.json();
        const locked = String(data?.slugLocked || initialLocked || "")
          .trim()
          .toLowerCase();
        
        if (locked && mounted) {
          setSlugLocked(locked);
          setSlugDirty(true);
          setSlug(locked);
          setSlugAvailable(true);
          setSlugChecking(false);
        }
      } catch {}
    };

    checkReservation();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // Check slug availability
  useEffect(() => {
    if (!slug || slug.length < 5) {
      setSlugAvailable(null);
      return;
    }
    if (slugLocked) {
      setSlugAvailable(true);
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

  // Validation
  const domainValid = useMemo(() => isDomainValid(domain), [domain]);

  // Actions

  const create = async () => {
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
      
      // Update cache
      try {
        queryClient.setQueryData(["workspaces"], (prev: any) => {
          const list = Array.isArray(prev) ? prev : prev?.workspaces || [];
          const next = [...list, data?.workspace].filter(Boolean);
          return prev && prev.workspaces ? { ...prev, workspaces: next } : next;
        });
        if (data?.workspace) {
          queryClient.setQueryData(["workspace", createdSlug], data.workspace);
        }
      } catch {}

      router.push(`/workspaces/${createdSlug}`);
    } catch (e: unknown) {
      toast.error(
        (e as { message?: string })?.message || "Failed to create workspace"
      );
    } finally {
      setIsCreating(false);
    }
  };

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
    handleSlugChange: (v: string) => {
      setSlugDirty(true);
      setSlug(cleanSlug(v));
    }
  };
}
