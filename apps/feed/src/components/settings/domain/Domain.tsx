"use client";

import React from "react";
//
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import { Button } from "@feedgot/ui/components/button";
import RecordsTable from "./RecordsTable";
import { useDomain, useDomainActions } from "../../../lib/domain-service";
import type { DomainInfo } from "../../../types/domain";
import { Label } from "@feedgot/ui/components/label";
import DomainActions from "./DomainActions";
import AddDomainDialog from "./AddDomainDialog";
import { ArrowIcon } from "@feedgot/ui/icons/arrow";
import { normalizePlan } from "@/lib/plan";
import { useCanEditDomain } from "@/hooks/useWorkspaceAccess";
export default function DomainSection({ slug, initialPlan }: { slug: string; initialPlan?: string }) {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useDomain(slug);
  const plan = normalizePlan(data?.plan || "free");
  const info = (data?.info || null) as DomainInfo;
  const canUse = plan === "starter" || plan === "professional";
  const { loading: accessLoading, canEditDomain } = useCanEditDomain(slug);

  const { createMutation, verifyMutation, deleteMutation, handleCreate, handleVerify, handleDelete } = useDomainActions({
    slug,
    info,
    canUse,
    canEditDomain,
    onCreated: () => setOpen(false),
  });

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
                onDelete={handleDelete}
                disabled={!canEditDomain}
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
                disabled={isLoading || accessLoading || !canUse || !canEditDomain}
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

        <PlanNotice slug={slug} feature="domain" plan={initialPlan || plan} />
      </div>
    </SectionCard>
  );
}
