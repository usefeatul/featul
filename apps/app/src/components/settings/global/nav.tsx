"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import { ArrowLeftIcon } from "@featul/ui/icons/arrow-left";
import { BoardIcon } from "@featul/ui/icons/board";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { CloudIcon } from "@featul/ui/icons/cloud";
import { DomainIcon } from "@featul/ui/icons/domain";
import { DownloadIcon } from "@featul/ui/icons/download";
import { IntegrationIcon } from "@featul/ui/icons/integration";
import { LockIcon } from "@featul/ui/icons/lock";
import MemberIcon from "@featul/ui/icons/member";
import { PaymentIcon } from "@featul/ui/icons/payment";
import { SettingIcon } from "@featul/ui/icons/setting";
import { ShieldIcon } from "@featul/ui/icons/shield";

type SettingsNavItem = {
  value: string;
  label: string;
  icon: (className: string) => React.ReactNode;
};

type SettingsNavGroup = {
  title: string;
  items: SettingsNavItem[];
};

const settingsIconClass =
  "size-4 opacity-100 [&_*]:opacity-100 [&_path]:[fill-opacity:1] [&_g]:[fill-opacity:1]";

const groups: SettingsNavGroup[] = [
  {
    title: "Workspace",
    items: [
      {
        value: "branding",
        label: "Branding",
        icon: (className) => <ShieldIcon className={className} width={16} height={16} />,
      },
      {
        value: "team",
        label: "Team",
        icon: (className) => <MemberIcon className={className} size={16} />,
      },
      {
        value: "domain",
        label: "Domain",
        icon: (className) => <DomainIcon className={className} size={16} />,
      },
      {
        value: "workspace",
        label: "Workspace",
        icon: (className) => <SettingIcon className={className} size={16} />,
      },
    ],
  },
  {
    title: "Product",
    items: [
      {
        value: "feedback",
        label: "Feedback",
        icon: (className) => <BoardIcon className={className} size={16} />,
      },
      {
        value: "changelog",
        label: "Changelog",
        icon: (className) => <ChangelogIcon className={className} size={16} />,
      },
      {
        value: "board",
        label: "Board Settings",
        icon: (className) => <LockIcon className={className} width={16} height={16} />,
      },
    ],
  },
  {
    title: "Connections",
    items: [
      {
        value: "integrations",
        label: "Integrations",
        icon: (className) => <IntegrationIcon className={className} size={16} />,
      },
    ],
  },
  {
    title: "Billing & Data",
    items: [
      {
        value: "billing",
        label: "Billing",
        icon: (className) => <PaymentIcon className={className} size={16} />,
      },
      {
        value: "data",
        label: "Data & Import",
        icon: (className) => <DownloadIcon className={className} size={16} />,
      },
    ],
  },
];

export default function SettingsNav({
  slug,
  selected,
  workspaceName,
  logoUrl,
  className,
  onLinkClick,
}: {
  slug: string;
  selected: string;
  workspaceName?: string;
  logoUrl?: string | null;
  className?: string;
  onLinkClick?: () => void;
}) {
  const name = workspaceName?.trim() || slug || "Workspace";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col px-3 py-4", className)}>
      <div className="px-2 pb-5">
        <Link
          href={`/workspaces/${slug}`}
          onClick={onLinkClick}
          className="group mb-5 flex min-w-0 items-center gap-3 text-left"
        >
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-[var(--workspace-surface)] text-sm font-semibold text-foreground">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={36}
                height={36}
                className="size-full object-cover"
              />
            ) : (
              initial
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              {name}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-accent transition-colors group-hover:text-foreground">
              <ArrowLeftIcon className="size-3" />
              Back to dashboard
            </span>
          </span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-4 scrollbar-hide">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-accent">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = selected === item.value;

                return (
                  <Link
                    key={item.value}
                    href={`/workspaces/${slug}/settings/${item.value}`}
                    onClick={onLinkClick}
                    className={cn(
                      "grid h-9 grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-2 rounded-md px-3 text-sm transition-colors",
                      active
                        ? "border border-border bg-card text-foreground"
                        : "text-accent hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <span className="flex size-4 items-center justify-center justify-self-center">
                      {item.icon(settingsIconClass)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-2 pt-3">
        <Link
          href="https://www.featul.com/docs"
          onClick={onLinkClick}
          className="flex h-9 items-center gap-2 rounded-md px-2 text-sm text-accent transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <CloudIcon className={settingsIconClass} width={16} height={16} />
          Help
        </Link>
      </div>
    </div>
  );
}
