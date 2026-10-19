import type { ComponentType } from "react";
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
