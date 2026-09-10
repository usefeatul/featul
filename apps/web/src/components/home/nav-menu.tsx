"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { ChevronDownIcon } from "@featul/ui/icons/chevron-down";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { FeedbackIcon } from "@featul/ui/icons/feedback";
import { BoardIcon } from "@featul/ui/icons/board";
import { VoteIcon } from "@featul/ui/icons/vote";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { WidgetIcon } from "@featul/ui/icons/widget";
import { DashboardIcon } from "@featul/ui/icons/dashboard";
import { DocIcon } from "@featul/ui/icons/doc";
import { BookIcon } from "@featul/ui/icons/book";
import { WrenchIcon } from "@featul/ui/icons/wrench";
import { MemberIcon } from "@featul/ui/icons/member";
import { CodeIcon } from "@featul/ui/icons/code";
import { IntegrationIcon } from "@featul/ui/icons/integration";
import { ArticleIcon } from "@featul/ui/icons/article";
import { DomainIcon } from "@featul/ui/icons/domain";
import { cn } from "@featul/ui/lib/utils";
import {
  isExternalHref,
  isNavDropdown,
  navigationConfig,
  type NavIconName,
  type NavigationEntry,
  type NavigationItem,
} from "@/config/homeNav";

type FeatulIcon = ComponentType<{
  className?: string;
  size?: number;
  opacity?: number;
}>;

const navIcons: Record<NavIconName, FeatulIcon> = {
  feedback: FeedbackIcon,
  requests: BoardIcon,
  voting: VoteIcon,
  roadmap: RoadmapIcon,
  changelog: ChangelogIcon,
  widget: WidgetIcon,
  dashboard: DashboardIcon,
  docs: DocIcon,
  definitions: BookIcon,
  tools: WrenchIcon,
  "use-cases": MemberIcon,
  "open-source": CodeIcon,
  integrations: IntegrationIcon,
  blog: ArticleIcon,
  demo: BoardIcon,
  domain: DomainIcon,
};

const triggerClass =
  "relative z-10 inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-3 text-sm font-light text-accent transition-colors hover:text-foreground";

function NavLink({
  item,
  className,
  onNavigate,
}: {
  item: NavigationItem;
  className?: string;
  onNavigate?: () => void;
}) {
  const external = isExternalHref(item);
  return (
    <Link
      href={item.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : undefined)}
      className={className}
      onClick={onNavigate}
    >
      {item.name}
    </Link>
  );
}

function FeatureItem({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon ? navIcons[item.icon] : null;
  const external = isExternalHref(item);

  return (
    <Link
      href={item.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : undefined)}
      onClick={onNavigate}
      className="group flex items-start gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted"
    >
      {Icon ? (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-accent transition-colors group-hover:text-primary">
          <Icon aria-hidden className="size-4" size={16} />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{item.name}</span>
        {item.description ? (
          <span className="mt-0.5 block text-xs leading-4 text-accent">
            {item.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function ResourceItem({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const external = isExternalHref(item);
  return (
    <Link
      href={item.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : undefined)}
      onClick={onNavigate}
      className="block rounded-md px-0 py-1.5 text-sm text-accent transition-colors hover:text-foreground"
    >
      {item.name}
    </Link>
  );
}

function MegaPanel({
  item,
  labelledBy,
  onNavigate,
}: {
  item: NavigationEntry & { columns: NonNullable<NavigationEntry["columns"]> };
  labelledBy: string;
  onNavigate?: () => void;
}) {
  const hasDescriptions = item.columns.some((column) =>
    column.items.some((link) => Boolean(link.description)),
  );

  return (
    <div
      role="menu"
      aria-labelledby={labelledBy}
      className={cn(
        "overflow-hidden rounded-xl bg-background shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] ring-1 ring-border/50",
        item.highlight
          ? "w-[min(64rem,calc(100vw-2rem))]"
          : "w-[min(68rem,calc(100vw-2rem))]",
      )}
    >
      <div
        className={item.highlight ? "flex flex-col sm:flex-row" : undefined}
      >
        <div className="min-w-0 flex-1 bg-background p-5 sm:p-6 lg:p-7">
          <div
            className={cn(
              "grid gap-8 lg:gap-10",
              item.highlight ? "sm:grid-cols-2" : "sm:grid-cols-3",
            )}
          >
            {item.columns.map((column) => (
              <div key={column.title}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
                  {column.title}
                </p>
                <div
                  className={cn(
                    "mt-3",
                    hasDescriptions ? "space-y-1" : "space-y-0.5",
                  )}
                >
                  {column.items.map((link) =>
                    hasDescriptions ? (
                      <FeatureItem
                        key={link.name}
                        item={link}
                        onNavigate={onNavigate}
                      />
                    ) : (
                      <ResourceItem
                        key={link.name}
                        item={link}
                        onNavigate={onNavigate}
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {item.highlight ? (
          <div className="flex w-full shrink-0 flex-col border-t border-border bg-card p-5 sm:w-[18.5rem] sm:border-t-0 sm:border-l sm:p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
              {item.highlight.eyebrow}
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug text-foreground">
              {item.highlight.title}
            </p>
            <p className="text-accent mt-1.5 text-xs leading-5">
              {item.highlight.description}
            </p>
            <Link
              href={item.highlight.href}
              onClick={onNavigate}
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {item.highlight.cta}
              <ChevronRightIcon className="size-3.5" size={14} />
            </Link>
          </div>
        ) : null}
      </div>
      {item.footer ? (
        <div className="border-t border-border bg-card px-5 py-3.5 sm:px-6">
          <Link
            href={item.footer.href}
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-primary"
          >
            {item.footer.name}
            <ChevronRightIcon className="size-3.5" size={14} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function DesktopNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );
  const [animatePill, setAnimatePill] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const navId = useId();
  const openItem = navigationConfig.main.find((item) => item.name === open);
  const activeName = hovered ?? open;
  const activeIsDropdown = Boolean(
    activeName &&
      navigationConfig.main.some(
        (item) => item.name === activeName && isNavDropdown(item),
      ),
  );

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(null);
      setHovered(null);
    }, 140);
  };

  const setItemRef = (name: string) => (node: HTMLElement | null) => {
    if (node) itemRefs.current.set(name, node);
    else itemRefs.current.delete(name);
  };

  useLayoutEffect(() => {
    if (!activeName) {
      setPill(null);
      setAnimatePill(false);
      return;
    }

    const list = listRef.current;
    const el = itemRefs.current.get(activeName);
    if (!list || !el) return;

    const listBox = list.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    setPill({
      left: box.left - listBox.left,
      width: box.width,
    });

    const frame = window.requestAnimationFrame(() => setAnimatePill(true));
    return () => window.cancelAnimationFrame(frame);
  }, [activeName]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(null);
        setHovered(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => cancelClose(), []);

  return (
    <nav
      className="absolute left-1/2 hidden -translate-x-1/2 md:flex md:items-center"
      onPointerLeave={scheduleClose}
      onPointerEnter={cancelClose}
    >
      <ul ref={listRef} className="relative flex items-center gap-1">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 h-8 rounded-md bg-card",
            activeIsDropdown && "border border-border",
            animatePill
              ? "motion-safe:transition-[left,width,opacity,border-color] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "motion-safe:transition-opacity motion-safe:duration-150",
            pill ? "opacity-100" : "opacity-0",
          )}
          style={{
            left: pill?.left ?? 0,
            width: pill?.width ?? 0,
          }}
        />
        {navigationConfig.main.map((item) => {
          const triggerId = `${navId}-${item.name}`;
          const isActive = activeName === item.name;

          if (!isNavDropdown(item)) {
            return (
              <li
                key={item.name}
                onPointerEnter={() => {
                  cancelClose();
                  setHovered(item.name);
                  setOpen(null);
                }}
              >
                <span ref={setItemRef(item.name)} className="inline-flex">
                  <NavLink
                    item={{ name: item.name, href: item.href ?? "/" }}
                    className={cn(triggerClass, isActive && "text-foreground")}
                    onNavigate={onNavigate}
                  />
                </span>
              </li>
            );
          }

          const isOpen = open === item.name;
          return (
            <li
              key={item.name}
              onPointerEnter={() => {
                cancelClose();
                setHovered(item.name);
                setOpen(item.name);
              }}
            >
              <button
                id={triggerId}
                ref={setItemRef(item.name)}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className={cn(triggerClass, isActive && "text-foreground")}
                onClick={() => setOpen(isOpen ? null : item.name)}
              >
                {item.name}
                <ChevronDownIcon
                  className={cn(
                    "size-3 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                  width={12}
                  height={12}
                />
              </button>
            </li>
          );
        })}
      </ul>
      {openItem && isNavDropdown(openItem) ? (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-8">
          <MegaPanel
            item={openItem}
            labelledBy={`${navId}-${openItem.name}`}
            onNavigate={() => {
              setOpen(null);
              setHovered(null);
              onNavigate?.();
            }}
          />
        </div>
      ) : null}
    </nav>
  );
}
