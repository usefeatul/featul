import type { ComponentType } from "react";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";
import { IntegrationIcon } from "@featul/ui/icons/integration";

type IconProps = { className?: string; size?: number };

const INTEGRATION_ICONS: Record<string, ComponentType<IconProps>> = {
  slack: SlackIcon,
  discord: DiscordIcon,
  notra: NotraIcon,
  nolt: NoltIcon,
  canny: CannyIcon,
  productboard: ProductBoardIcon,
};

export const COMING_SOON_INTEGRATION_SLUGS = new Set([
  "nolt",
  "canny",
  "productboard",
]);

export function getIntegrationIcon(slug: string): ComponentType<IconProps> {
  return INTEGRATION_ICONS[slug] ?? IntegrationIcon;
}
