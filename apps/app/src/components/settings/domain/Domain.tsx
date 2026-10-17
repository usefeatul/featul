"use client";

import React from "react";
import SectionCard, { type SectionCardStatus } from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import RecordsTable from "./RecordsTable";
import { useDomain, useDomainActions } from "../../../lib/domain/service";
import type { DomainInfo } from "../../../types/domain";
import { Label } from "@featul/ui/components/label";
import DomainActions from "./DomainActions";
import AddDomainDialog from "./AddDomainDialog";
import DomainHostField from "./DomainHostField";
import { ArrowIcon } from "@/components/global/icons";
import { normalizePlan } from "@/lib/plan";
import { useCanEditDomain } from "@/hooks/useWorkspaceAccess";
import { LoadingButton } from "@/components/global/LoadingButton";
import { toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";
export default function DomainSection({
  slug,
  initialPlan,
  initialInfo,
  initialDefaultDomain,
}: {
  slug: string;
  initialPlan?: string;
  initialInfo?: DomainInfo;
  initialDefaultDomain?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const initialDomainData =
    initialInfo !== undefined ||
    initialDefaultDomain !== undefined ||
    initialPlan !== undefined
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

  const {
    createMutation,
    verifyMutation,
    deleteMutation,
    handleCreate,
    handleVerify,
    handleDelete,
  } = useDomainActions({
    slug,
    info,
    canUse,
    canEditDomain,
    onCreated: () => setOpen(false),
  });
  const currentHost = info?.host || `${slug}.featul.com`;
  const status: SectionCardStatus | undefined = !info?.host
    ? undefined
    : verifyMutation.isPending
      ? {
          tone: "info",
          label: "In progress",
          message: "Checking your DNS records. This may take a moment.",
        }
      : info.status === "verified"
        ? { tone: "success", label: "Verified" }
        : {
            tone: "warning",
            label: "Action needed",
            message:
              info.status === "error"
                ? "Domain verification failed. Check the DNS records shown above with your provider, then verify again."
                : "Add the DNS records shown above with your domain provider, then verify your domain.",
          };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Manage Domain"
        description="Create a custom domain for your workspace."
        status={status}
        action={
          info?.host ? (
            info.status !== "verified" || verifyMutation.isPending ? (
              <LoadingButton
                type="button"
                variant="card"
                size="sm"
                onClick={handleVerify}
                loading={verifyMutation.isPending}
                disabled={
                  isLoading ||
                  accessLoading ||
                  !canEditDomain ||
                  deleteMutation.isPending
                }
              >
                {verifyMutation.isPending ? "Verifying" : "Verify domain"}
              </LoadingButton>
            ) : undefined
          ) : (
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
        <div className="space-y-4">
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
                    "inline-flex shrink-0 items-center gap-1 border-l border-border/50 px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring last:rounded-r-xl dark:border-white/[0.07]",
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

          {info?.host ? (
            <div className="space-y-2">
              <Label className="block">DNS Records</Label>
              <RecordsTable info={info} />
            </div>
          ) : null}
        </div>
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
