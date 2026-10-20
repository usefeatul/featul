"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { HelpImportUsage } from "@featul/api/help/import/usage";
import { client } from "@featul/api/client";
import { getPlanLimits } from "@featul/api/shared/plan";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import {
  AnalyticsIcon,
  ArticleIcon,
  BookIcon,
  PanelIcon,
  SparklesIcon,
} from "@/components/global/icons";
import { WebsiteFavicon } from "@/components/wizard/WebsiteFavicon";
import { helpImportHref } from "@/components/help/import-url";
import {
  GithubRepoField,
  useGithubSetupToast,
} from "@/components/help/GithubRepoField";
import { expectOk } from "@/hooks/useHelpTree";
import { relativeTime } from "@/lib/time";
import { UsageMeter } from "../billing/usage";
import SectionCard from "../global/SectionCard";

type ImportStatus = {
  plan: string;
  usage: HelpImportUsage;
  counts: { collections: number; published: number; aiAnswers: number };
};

/** Settings → Help Center: scan sources and allowance, plus usage against the plan's help limits. */
export default function HelpCenterSection({
  slug,
  plan,
}: {
  slug: string;
  plan?: string;
}) {
  useGithubSetupToast();
  const { data } = useQuery<ImportStatus>({
    queryKey: ["help-import-status", slug],
    queryFn: async () => {
      const res = await client.help.importStatus.$get({ slug });
      await expectOk(res, "Couldn't load help center settings");
      return (await res.json()) as ImportStatus;
    },
  });
  const usage = data?.usage;
  const [site, setSite] = React.useState("");
  const [repo, setRepo] = React.useState("");
  React.useEffect(() => {
    if (!usage) return;
    setSite((v) => v || usage.site || "");
    setRepo((v) => v || usage.repo || "");
  }, [usage]);

  const limits = getPlanLimits(data?.plan ?? plan ?? "free");
  const monthly = usage?.window === "month";
  const outOfScans = usage ? usage.remaining <= 0 : false;
  const canScan = !outOfScans && Boolean(site.trim() || repo.trim());
  const params: Record<string, string> = { start: "1" };
  if (site.trim()) params.site = site.trim();
  if (repo.trim()) params.repo = repo.trim();
  const billingHref = `/workspaces/${slug}/settings/billing`;

  const sourceRow = "flex items-center gap-3 px-5 py-3";
  const field = cn(
    raisedSurfaceClass,
    "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/15",
  );

  return (
    <div className="space-y-8">
      <SectionCard
        title="Draft from your website"
        icon={<SparklesIcon className="size-4 text-primary" />}
        contentClassName="py-0"
        status={
          outOfScans
            ? {
                tone: "neutral",
                label: monthly ? "Monthly limit reached" : "Starter",
                message: monthly ? (
                  "Your scans reset on the 1st of next month."
                ) : (
                  <>
                    Your free setup scan is used.{" "}
                    <Link
                      href={billingHref}
                      className="font-medium underline underline-offset-2"
                    >
                      Upgrade to Starter
                    </Link>{" "}
                    to re-scan as your product changes.
                  </>
                ),
              }
            : undefined
        }
      >
        <p className="py-4 text-sm text-accent">
          We read these sources and draft new help articles. New drafts never
          overwrite articles you already have.
        </p>
        <div className="-mx-5 divide-y divide-border/50 border-t border-border/50">
          <div className={sourceRow}>
            <span className="w-28 shrink-0 text-sm text-muted-foreground">
              Website
            </span>
            <label className={field}>
              <WebsiteFavicon domain={site} className="size-4 rounded-sm" />
              <Input
                variant="plain"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="example.com"
                className="h-9 flex-1 px-0"
                aria-label="Website"
              />
            </label>
          </div>
          <div className={sourceRow}>
            <span className="w-28 shrink-0 text-sm text-muted-foreground">
              GitHub
            </span>
            <GithubRepoField
              workspaceSlug={slug}
              value={repo}
              onChange={setRepo}
              className="min-w-0 flex-1"
              inputClassName="h-9"
            />
          </div>
          <UsageMeter
            label={monthly ? "Scans this month" : "Setup scan"}
            icon={SparklesIcon}
            used={usage?.used ?? 0}
            limit={usage?.limit ?? null}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <p className="text-xs text-muted-foreground">
              Up to {limits.helpImportMaxPages} pages and{" "}
              {limits.helpImportMaxArticles} drafts per scan
              {usage?.lastImportAt
                ? ` · last scan ${relativeTime(new Date(usage.lastImportAt).toISOString())}`
                : ""}
            </p>
            {canScan ? (
              <Button asChild size="sm">
                <Link
                  href={helpImportHref(slug, params)}
                >
                  <SparklesIcon className="size-3.5" />
                  Scan again
                </Link>
              </Button>
            ) : (
              <Button size="sm" disabled>
                <SparklesIcon className="size-3.5" />
                Scan again
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Help center usage" contentClassName="py-0">
        <div className="-mx-5 divide-y divide-border/50">
          <UsageMeter
            label="Collections"
            icon={BookIcon}
            used={data?.counts.collections ?? 0}
            limit={limits.maxHelpCollections}
          />
          <UsageMeter
            label="Published articles"
            icon={ArticleIcon}
            used={data?.counts.published ?? 0}
            limit={limits.maxHelpArticles}
            unit="published"
          />
          {limits.monthlyHelpAiAnswers > 0 ? (
            <UsageMeter
              label="Ask AI answers this month"
              icon={SparklesIcon}
              used={data?.counts.aiAnswers ?? 0}
              limit={limits.monthlyHelpAiAnswers}
            />
          ) : null}
          {[
            {
              label: "Help articles in the widget",
              icon: PanelIcon,
              on: limits.allowHelpWidget,
              plan: "Starter",
            },
            {
              label: "Help center analytics",
              icon: AnalyticsIcon,
              on: limits.allowHelpAnalytics,
              plan: "Starter",
            },
            ...(limits.monthlyHelpAiAnswers > 0
              ? []
              : [
                  {
                    label: "Ask AI",
                    icon: SparklesIcon,
                    on: false,
                    plan: "Professional",
                  },
                ]),
          ].map(({ label, icon: Icon, on, plan: needs }) => (
            <div
              key={label}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm"
            >
              <div className="flex items-center gap-3">
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </div>
              {on ? (
                <span className="text-xs text-muted-foreground">Included</span>
              ) : (
                <Link
                  href={billingHref}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {needs} plans
                </Link>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
