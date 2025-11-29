"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import { toast } from "sonner";
import { Button } from "@feedgot/ui/components/button";
import RecordsTable from "./RecordsTable";
import {
  loadDomain,
  createDomain,
  verifyDomain,
  deleteDomain,
} from "../../../lib/domain-service";
import type { DomainInfo } from "../../../types/domain";
import { Label } from "@feedgot/ui/components/label";
import DomainActions from "./DomainActions";
import AddDomainDialog from "./AddDomainDialog";
import { ArrowIcon } from "@feedgot/ui/icons/arrow";
import { normalizePlan } from "@/lib/plan";

export default function DomainSection({ slug }: { slug: string }) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["domain", slug],
    queryFn: () => loadDomain(slug),
    staleTime: 300000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const plan = normalizePlan(data?.plan || "free");
  const info = (data?.info || null) as DomainInfo;
  const canUse = plan === "starter" || plan === "professional";

  const createMutation = useMutation({
    mutationFn: (base: string) => createDomain(slug, base),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || "Failed to add domain");
        return;
      }
      toast.success("Domain added. Configure DNS and verify.");
      setOpen(false);
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
    const v = base.trim();
    if (!v) {
      toast.error("Enter a domain");
      return;
    }
    createMutation.mutate(v);
  };

  const handleVerify = () => {
    verifyMutation.mutate();
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
                  verifying={verifyMutation.isPending}
                  deleting={deleteMutation.isPending}
                  onVerify={handleVerify}
                  onDelete={() => deleteMutation.mutate()}
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
                disabled={isLoading || !canUse}
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
          saving={createMutation.isPending}
        />

        <PlanNotice slug={slug} feature="domain" plan={plan} />
      </div>
    </SectionCard>
  );
}
