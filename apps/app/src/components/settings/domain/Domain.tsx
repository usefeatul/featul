"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import RecordsTable from "./RecordsTable";
import { useDomain, useDomainActions } from "../../../lib/domain/service";
import type { DomainInfo } from "../../../types/domain";
import { Label } from "@featul/ui/components/label";
import DomainActions from "./DomainActions";
import AddDomainDialog from "./AddDomainDialog";
import DomainHostField from "./DomainHostField";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import { normalizePlan } from "@/lib/plan";
import { useCanEditDomain } from "@/hooks/useWorkspaceAccess";
import { LoadingButton } from "@/components/global/LoadingButton";
import { toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";
export default function DomainSection({ slug, initialPlan, initialInfo, initialDefaultDomain }: { slug: string; initialPlan?: string; initialInfo?: DomainInfo; initialDefaultDomain?: string }) {
  const [open, setOpen] = React.useState(false);
  const initialDomainData =
    initialInfo !== undefined || initialDefaultDomain !== undefined || initialPlan !== undefined
      ? {
          info: initialInfo ?? null,
          plan: String(initialPlan || "free"),
          defaultDomain: String(initialDefaultDomain || ""),
        }
      : undefined;
  const { data, isLoading } = useDomain(slug, initialDomainData);
  const plan = normalizePlan(data?.plan || "free");
  const info = data?.info ?? null;
  const canUse = plan === "starter" || plan === "professional";
  const { loading: accessLoading, canEditDomain } = useCanEditDomain(slug);

  const { createMutation, verifyMutation, deleteMutation, handleCreate, handleVerify, handleDelete } = useDomainActions({
    slug,
    info,
    canUse,
    canEditDomain,
    onCreated: () => setOpen(false),
  });
  const currentHost = info?.host || `${slug}.featul.com`;

  return (
    <div className="space-y-4">
    <SectionCard
      title="Manage Domain"
      description="Create a custom domain for your workspace."
      action={
        info?.host ? undefined : (
          <LoadingButton
            type="button"
            onClick={() => setOpen(true)}
            disabled={isLoading || accessLoading || !canUse || !canEditDomain}
          >
            Add domain
          </LoadingButton>
        )
      }
    >

        <div className="space-y-2">
          <DomainHostField
            value={currentHost}
            readOnly
            trailing={
              <>
                <a
                  href={`https://${currentHost}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    toolbarItemClass,
                    "inline-flex shrink-0 items-center gap-1 border-l border-border px-2.5 text-xs font-medium text-accent hover:bg-transparent",
                  )}
                >
                  Visit
                  <ArrowIcon className="size-3.5" />
                </a>
                {info?.host ? (
                  <span
                    className={cn(
                      toolbarItemClass,
                      "inline-flex items-center px-1 hover:bg-transparent",
                    )}
                  >
                    <DomainActions
                      verifying={verifyMutation.isPending}
                      deleting={deleteMutation.isPending}
                      onVerify={handleVerify}
                      onDelete={handleDelete}
                      disabled={!canEditDomain}
                    />
                  </span>
                ) : null}
              </>
            }
          />
        </div>

        {info?.host ? (
          <div className="space-y-2 mb-3">
            <Label>DNS Records</Label>
            <RecordsTable info={info} />
          </div>
        ) : null}
        <AddDomainDialog
          open={open}
          onOpenChange={setOpen}
          onSave={(v) => handleCreate(v)}
          saving={createMutation.isPending}
        />

    </SectionCard>
    <PlanNotice slug={slug} feature="domain" plan={initialPlan || plan} />
    </div>
  );
}
