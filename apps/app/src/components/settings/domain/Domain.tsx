"use client";

import React from "react";
//
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import RecordsTable from "./RecordsTable";
import { useDomain, useDomainActions } from "../../../lib/domain-service";
import type { DomainInfo } from "../../../types/domain";
import { Label } from "@featul/ui/components/label";
import DomainActions from "./DomainActions";
import AddDomainDialog from "./AddDomainDialog";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import { normalizePlan } from "@/lib/plan";
import { useCanEditDomain } from "@/hooks/useWorkspaceAccess";
import { LoadingButton } from "@/components/global/loading-button";
export default function DomainSection({ slug, initialPlan, initialInfo, initialDefaultDomain }: { slug: string; initialPlan?: string; initialInfo?: DomainInfo; initialDefaultDomain?: string }) {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useDomain(slug, initialInfo !== undefined || initialDefaultDomain !== undefined || initialPlan !== undefined ? { info: (initialInfo || null) as DomainInfo, plan: String(initialPlan || "free"), defaultDomain: String(initialDefaultDomain || "") } : undefined);
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

        <div className="space-y-2">
          {info?.host ? (
            <div className="bg-background flex items-center justify-between rounded-md border p-3">
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
            <div className="bg-background mt-2 mb-3 flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">{`https://${slug}.featul.com`}</span>
              <LoadingButton
                type="button"
                onClick={() => setOpen(true)}
                disabled={isLoading || accessLoading || !canUse || !canEditDomain}
              >
                Add domain
              </LoadingButton>
            </div>
          )}

          <div className="flex items-center mt-3 mb-3 justify-start ">
            <a
              href={
                info?.host
                  ? `https://${info.host}`
                  : `https://${slug}.featul.com`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-1 py-1 rounded-sm  bg-muted/70 ring-1 ring-border text-xs hover:bg-muted/80"
            >
              <span>Visit</span>
              <ArrowIcon className="size-4" />
            </a>
          </div>
        </div>

        {info?.host ? (
          <div className="space-y-2 mb-3">
            <Label>DNS Records</Label>
            <div className="rounded-md  border overflow-hidden">
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

    </SectionCard>
  );
}
