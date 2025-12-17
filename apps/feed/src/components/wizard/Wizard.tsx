"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@oreilla/ui/components/button";
import Progress from "./Progress";
import StepName from "./StepName";
import StepDomain from "./StepDomain";
import StepSlug from "./StepSlug";
import TimezonePicker from "./TimezonePicker";
import { client } from "@oreilla/api/client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  workspaceSchema,
  isNameValid,
  isDomainValid,
  isSlugValid,
  isTimezoneValid,
  cleanSlug,
  slugifyFromName,
} from "../../lib/validators";

export default function WorkspaceWizard({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const total = 4;

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugLocked, setSlugLocked] = useState<string | null>(null);

  const [timezone, setTimezone] = useState<string>(
    typeof Intl !== "undefined" &&
      Intl.DateTimeFormat().resolvedOptions().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"
  );
  const [now, setNow] = useState<Date>(new Date());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (slugDirty) return;
    const s = slugifyFromName(name);
    setSlug(s);
  }, [name, slugDirty]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const initialLocked = (searchParams?.get("slug") || "")
      .trim()
      .toLowerCase();
    let mounted = true;
    (async () => {
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
    })();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

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
  }, [slug]);

  const domainValid = useMemo(() => isDomainValid(domain), [domain]);

  const domainFavicon = useMemo(() => {
    if (!domainValid) return null;
    const host = domain.trim().toLowerCase();
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
      host
    )}&sz=64`;
  }, [domain, domainValid]);

  const canNext = useMemo(() => {
    if (step === 0) return isNameValid(name);
    if (step === 1) return domainValid;
    if (step === 2) return isSlugValid(slug) && slugAvailable === true;
    if (step === 3) return isTimezoneValid(timezone);
    return false;
  }, [step, name, domainValid, slug, slugAvailable, timezone]);

  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

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

  return (
    <section className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className={`w-full max-w-[520px] mx-auto ${className}`}>
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">
            Welcome to Oreilla
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Set up your workspace
          </h1>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border ring-1 ring-border p-6 sm:p-10 shadow-sm">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <Progress step={step} total={total} />
            <span className="text-[10px] uppercase tracking-wider text-accent font-medium whitespace-nowrap">
              Step {step + 1} / {total}
            </span>
          </div>

          <div className="min-h-[220px]">
            {step === 0 && (
              <>
                <StepName
                  name={name}
                  onChange={setName}
                  isValid={isNameValid(name)}
                />
                {slugLocked ? (
                  <div className="mt-5">
                    <div className="rounded-sm bg-muted/50 px-2 py-2 text-xs">
                      <span className="text-accent">Reserved:</span>{" "}
                      <span className="">{slugLocked}.oreilla.com</span>
                    </div>
                  </div>
                ) : null}
              </>
            )}
            {step === 1 && (
              <StepDomain
                domain={domain}
                onChange={setDomain}
                isValid={domainValid}
              />
            )}
            {step === 2 && (
              <StepSlug
                slug={slug}
                onChange={(v) => {
                  setSlugDirty(true);
                  setSlug(cleanSlug(v));
                }}
                checking={slugChecking}
                available={slugAvailable}
                disabled={!!slugLocked}
              />
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Choose your team&apos;s timezone.
                  </h2>
                  <p className="text-sm text-accent">
                    We&apos;ll use this for your feedback and roadmap dates.
                  </p>
                </div>
                <TimezonePicker
                  value={timezone}
                  onChange={setTimezone}
                  now={now}
                />
                {!isTimezoneValid(timezone) ? (
                  <p className="text-xs text-destructive">
                    Please select a valid timezone.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={prev}
              disabled={step === 0}
              className={step === 0 ? "invisible" : ""}
            >
              Back
            </Button>

            <div className="flex items-center gap-4">
              {step === 1 && domainFavicon ? (
                <div className="flex items-center">
                  <img
                    src={domainFavicon}
                    alt="Favicon"
                    className="h-6 w-6 rounded-sm bg-background"
                  />
                </div>
              ) : null}

              {step < total - 1 ? (
                <Button
                  type="button"
                  onClick={next}
                  disabled={!canNext}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={create}
                  disabled={!canNext || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Workspace"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
