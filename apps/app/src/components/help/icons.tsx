import type { ComponentType } from "react";
import { cn } from "@featul/ui/lib/utils";
import { HELP_COLLECTION_ICONS } from "@featul/api/validators/help";
import {
  AccountIcon,
  BillingIcon,
  BoltIcon,
  BookIcon,
  BulbIcon,
  CollectIcon,
  IntegrationIcon,
  SettingIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/global/icons";

export type HelpCollectionIconKey = (typeof HELP_COLLECTION_ICONS)[number];

const ICONS: Record<HelpCollectionIconKey, ComponentType<{ className?: string }>> = {
  book: BookIcon,
  bolt: BoltIcon,
  card: BillingIcon,
  user: AccountIcon,
  settings: SettingIcon,
  puzzle: IntegrationIcon,
  shield: ShieldIcon,
  chat: CollectIcon,
  sparkles: SparklesIcon,
  bulb: BulbIcon,
};

export const HELP_ICON_KEYS = HELP_COLLECTION_ICONS;

/** Collection artwork by stored key; unknown keys fall back to the book. */
export function HelpCollectionIcon({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) {
  const Icon = ICONS[(icon as HelpCollectionIconKey) || "book"] ?? BookIcon;
  return <Icon className={className} />;
}

/** Raised-surface depth (gradient + lit top edge) with a barely-there drop shadow. */
export const helpCollectionTileClass =
  "flex shrink-0 items-center justify-center rounded-lg [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-xl border border-black/[0.08] bg-card bg-linear-to-b from-card to-[color-mix(in_oklab,var(--card),var(--foreground)_5%)] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_1px_rgba(0,0,0,0.03)] dark:border-white/[0.07] dark:from-[color-mix(in_oklab,var(--card),white_5%)] dark:to-card dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_1px_rgba(0,0,0,0.12)]";

/** Collection icon on its tile, as on the public help center and in the dashboard. */
export function HelpCollectionTile({
  icon,
  className,
  iconClassName = "size-4.5",
}: {
  icon?: string | null;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn(helpCollectionTileClass, "size-9", className)}>
      <HelpCollectionIcon icon={icon} className={iconClassName} />
    </span>
  );
}
