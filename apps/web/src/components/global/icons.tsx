/** Marketing icons share the app's filled artwork and neutral sidebar tone. */
import type { ComponentType, SVGProps } from "react";
import {
  IconBookFilled,
  IconArchiveFilled,
  IconCircleCheckFilled,
  IconCodeCircleFilled,
  IconCreditCardFilled,
  IconExternalLinkFilled,
  IconFileTextFilled,
  IconFolderFilled,
  IconGiftFilled,
  IconLayoutBoardFilled,
  IconLayoutBottombarFilled,
  IconLayoutDashboardFilled,
  IconLockFilled,
  IconMailFilled,
  IconMessageFilled,
  IconMessageCircleFilled,
  IconPuzzleFilled,
  IconSettingsFilled,
  IconShieldCheckFilled,
  IconSparklesFilled,
  IconClockFilled,
  IconThumbUpFilled,
  IconUserFilled,
  IconWorldFilled,
  IconEditFilled,
  IconTagFilled,
  IconListCheckFilled,
} from "@tabler/icons-react";
import {
  ArrowBigUp,
  ArrowLeft,
  Check,
  ChevronDown,
  GitMerge,
  Link2,
  Menu,
  Undo2,
} from "lucide-react";
import { HomeIcon as ProductHomeIcon } from "@featul/ui/icons/home";
import { SearchIcon as ProductSearchIcon } from "@featul/ui/icons/search";
import {
  RoadmapIcon as ProductRoadmapIcon,
  ChangelogIcon as ProductChangelogIcon,
} from "@featul/ui/icons/product";
import { cn } from "@featul/ui/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function marketingIcon(Icon: ComponentType<IconProps>, strokeWidth?: number) {
  return function MarketingIcon({ size = 18, className, ...props }: IconProps) {
    return (
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        {...props}
        className={cn(className, "text-neutral-600 dark:text-neutral-300")}
        aria-hidden={
          props["aria-hidden"] ?? (props["aria-label"] ? undefined : true)
        }
      />
    );
  };
}

export const BoardIcon = marketingIcon(IconLayoutBoardFilled);
export const RoadmapIcon = marketingIcon(ProductRoadmapIcon);
export const ChangelogIcon = marketingIcon(ProductChangelogIcon);
export const FeedbackIcon = marketingIcon(IconMessageFilled);
export const HomeIcon = marketingIcon(ProductHomeIcon);
export const EditIcon = marketingIcon(IconEditFilled);
export const TagIcon = marketingIcon(IconTagFilled);
export const ListFilterIcon = marketingIcon(IconListCheckFilled);
export const CommentsIcon = marketingIcon(IconMessageCircleFilled);
export const DomainIcon = marketingIcon(IconWorldFilled);
export const LockIcon = marketingIcon(IconLockFilled);
export const MemberIcon = marketingIcon(IconUserFilled);
export const UsersIcon = MemberIcon;
export const VoteIcon = marketingIcon(IconThumbUpFilled);
export const FreeIcon = marketingIcon(IconGiftFilled);
export const SetupIcon = marketingIcon(IconClockFilled);
export const CheckIcon = marketingIcon(IconCircleCheckFilled);
export const SparklesIcon = marketingIcon(IconSparklesFilled);
export const WidgetIcon = marketingIcon(IconLayoutBottombarFilled);
export const DashboardIcon = marketingIcon(IconLayoutDashboardFilled);
export const DocIcon = marketingIcon(IconFolderFilled);
export const BookIcon = marketingIcon(IconBookFilled);
export const WrenchIcon = marketingIcon(IconSettingsFilled);
export const CodeIcon = marketingIcon(IconCodeCircleFilled);
export const BoxIcon = marketingIcon(IconArchiveFilled);
export const CreditCardIcon = marketingIcon(IconCreditCardFilled);
export const IntegrationIcon = marketingIcon(IconPuzzleFilled);
export const ArticleIcon = marketingIcon(IconFileTextFilled);
export const EnvelopeIcon = marketingIcon(IconMailFilled);
export const ShieldIcon = marketingIcon(IconShieldCheckFilled);
export const ExternalLinkIcon = marketingIcon(IconExternalLinkFilled);

// Directional and connection controls keep the app's outline treatment.
export const MenuIcon = marketingIcon(Menu, 1.5);
export const ChevronDownIcon = marketingIcon(ChevronDown, 1.5);
export const MergeIcon = marketingIcon(GitMerge, 1.5);
export const LinkIcon = marketingIcon(Link2, 1.5);
export const SearchIcon = marketingIcon(ProductSearchIcon);
export const ArrowLeftIcon = marketingIcon(ArrowLeft, 1.5);
export const UndoIcon = marketingIcon(Undo2, 1.5);
export const CheckmarkIcon = marketingIcon(Check, 1.5);
/** Voting inherits the button color so the app's orange selected state is visible. */
export function UpvoteIcon({ size = 18, ...props }: IconProps) {
  return <ArrowBigUp size={size} strokeWidth={1.5} aria-hidden {...props} />;
}
