"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import { toast } from "sonner";
import { Button } from "@feedgot/ui/components/button";
import RecordsTable from "./RecordsTable";
import {
  loadDomain,
  createDomain,
  verifyDomain,
  deleteDomain,
} from "./service";
import type { DomainInfo } from "./types";
import { Label } from "@feedgot/ui/components/label";
import DomainActions from "./DomainActions";
import AddDomainDialog from "./AddDomainDialog";
import { ArrowIcon } from "@feedgot/ui/icons/arrow";

export default function DomainSection({ slug }: { slug: string }) {
  const [plan, setPlan] = React.useState<string>("free");
  const [info, setInfo] = React.useState<DomainInfo>(null);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadDomain(slug);
      setPlan(data.plan);

      setInfo(data.info);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    void load();
  }, [load]);
  const canUse = plan === "starter" || plan === "professional";

  const handleCreate = async (base: string) => {
    if (!canUse) {
      toast.error("Upgrade to Starter or Professional to use a custom domain");
      return;
    }
    const v = base.trim();
    if (!v) {
      toast.error("Enter a domain");
      return;
    }

    try {
      const result = await createDomain(slug, v);
      if (!result.ok) throw new Error(result.message || "Failed to add domain");
      toast.success("Domain added. Configure DNS and verify.");
      setOpen(false);
      await load();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Failed to add domain");
    } finally {
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await verifyDomain(slug);
      if (!result.ok) throw new Error(result?.message || "Verify failed");
      if (result?.status === "verified") toast.success("Domain verified");
      else toast.info("Records not found yet. Still pending.");
      await load();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Failed to verify domain");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SectionCard
      title="Manage Domain"
      description="Create a custom domain for your workspace."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          {info?.host ? (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{info.host}</span>
              </div>
              <div>
                <DomainActions
                  verifying={verifying}
                  onVerify={handleVerify}
                  onDelete={async () => {
                    const r = await deleteDomain(slug);
                    if (!r.ok) {
                      toast.error(r.message || "Delete failed");
                      return;
                    }
                    toast.success("Domain deleted");
                    await load();
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">{`https://${slug}.feedgot.com`}</span>
              <Button
                type="button"
                variant="quiet"
                onClick={() => setOpen(true)}
                disabled={loading || !canUse}
              >
                Add domain
              </Button>
            </div>
          )}

          <div className="flex items-center mt-3 justify-start">
            <a
              href={
                info?.host
                  ? `https://${info.host}`
                  : `https://${slug}.feedgot.com`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-1 py-1 rounded-md bg-muted ring-1 ring-border text-xs hover:bg-muted/80"
            >
              <span>Visit</span>
              <ArrowIcon width={14} height={14} />
            </a>
          </div>
        </div>

        {info?.host ? (
          <div className="space-y-2">
            <Label>DNS Records</Label>
            <div className="rounded-md border overflow-hidden">
              <RecordsTable info={info} />
            </div>
          </div>
        ) : null}
        <AddDomainDialog
          open={open}
          onOpenChange={setOpen}
          onSave={(v) => handleCreate(v)}
        />
      </div>
    </SectionCard>
  );
}
