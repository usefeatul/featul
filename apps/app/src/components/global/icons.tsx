/**
 * App icon entry point. Components import semantic names from here so repeated
 * actions share artwork. Add new library mappings here, or custom SVGs in artwork.tsx.
 * Search, chevrons, and directional controls intentionally retain their outline style.
 */
import {
  IconUserFilled,
  IconLayoutBoardFilled,
  IconMessageFilled,
  IconWorldFilled,
  IconPuzzleFilled,
  IconSettingsFilled,
  IconBellFilled,
  IconCircleCheckFilled,
  IconClockFilled,
  IconCopyFilled,
  IconExternalLinkFilled,
  IconTagFilled,
  IconTrashFilled,
  IconPhotoFilled,
  IconLockFilled,
  IconFlagFilled,
  IconSquareRoundedPlusFilled,
  IconShieldCheckFilled,
  IconEditFilled,
  IconPaletteFilled,
  IconArchiveFilled,
  IconCreditCardFilled,
  IconFolderFilled,
  IconDatabaseFilled,
  IconLayoutSidebarFilled,
  IconLayoutSidebarRightFilled,
  IconCalendarFilled,
  IconSortDescending2Filled,
  IconListCheckFilled,
  IconInfoCircleFilled,
  type Icon as TablerIcon,
  type IconProps as TablerIconProps,
} from "@tabler/icons-react";
import {
  LogoutIcon,
  RoadmapIcon,
  ChangelogIcon,
  ShareIcon,
  LowTractionIcon,
  FilterIcon,
} from "./artwork";
export {
  LogoutIcon,
  RoadmapIcon,
  ChangelogIcon,
  ShareIcon,
  LowTractionIcon,
  FilterIcon,
};
export { HomeIcon } from "@featul/ui/icons/home";
import {
  type LucideIcon,
  type LucideProps,
  AlertCircle as LucideAlertCircle,
  AlignLeft as LucideAlignLeft,
  ArrowBigDown as LucideArrowBigDown,
  ArrowBigUp as LucideArrowBigUp,
  ArrowLeft as LucideArrowLeft,
  ArrowRight as LucideArrowRight,
  ArrowUp as LucideArrowUp,
  ArrowUpRight as LucideArrowUpRight,
  CalendarCheck2 as LucideCalendarCheck2,
  Camera as LucideCamera,
  Check as LucideCheck,
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  ChevronsDown as LucideChevronsDown,
  ChevronsUp as LucideChevronsUp,
  ChevronsUpDown as LucideChevronsUpDown,
  CircleHelp as LucideCircleHelp,
  CircleUserRound as LucideCircleUserRound,
  Clipboard as LucideClipboard,
  ClipboardCheck as LucideClipboardCheck,
  Cloud as LucideCloud,
  Code2 as LucideCode2,
  EllipsisVertical as LucideEllipsisVertical,
  FileSpreadsheet as LucideFileSpreadsheet,
  FileText as LucideFileText,
  FileUp as LucideFileUp,
  Fingerprint as LucideFingerprint,
  GitMerge as LucideGitMerge,
  GripVertical as LucideGripVertical,
  History as LucideHistory,
  KeyRound as LucideKeyRound,
  Lightbulb as LucideLightbulb,
  Link2 as LucideLink2,
  List as LucideList,
  ListChecks as LucideListChecks,
  Mail as LucideMail,
  Maximize2 as LucideMaximize2,
  Menu as LucideMenu,
  MessageCircle as LucideMessageCircle,
  MessageSquareText as LucideMessageSquareText,
  MoreHorizontal as LucideMoreHorizontal,
  Paperclip as LucidePaperclip,
  Plus as LucidePlus,
  Redo2 as LucideRedo2,
  Save as LucideSave,
  ScanFace as LucideScanFace,
  Sparkles as LucideSparkles,
  Square as LucideSquare,
  Undo2 as LucideUndo2,
  Upload as LucideUpload,
  UserRoundPlus as LucideUserRoundPlus,
  Wand2 as LucideWand2,
  X as LucideX,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { PanelIcon as StatefulPanelIcon } from "@featul/ui/icons/panel";
import { SearchIcon as WorkspaceSearchIcon } from "@featul/ui/icons/search";

/** Outline controls retain their established 18px, 1.5px stroke. */
function outline(Icon: LucideIcon) {
  function OutlineIcon(props: LucideProps) {
    return (
      <Icon
        size={18}
        fill="none"
        strokeWidth={1.5}
        {...props}
        aria-hidden={
          props["aria-hidden"] ?? (props["aria-label"] ? undefined : true)
        }
      />
    );
  }

  OutlineIcon.displayName = `Outline${Icon.displayName ?? "Icon"}`;
  return OutlineIcon;
}

export type AppIcon = ComponentType<LucideProps>;

/** Filled semantic icons: use this module from app components, never a library directly. */
function solid(Icon: TablerIcon) {
  return function FilledIcon(props: TablerIconProps) {
    return (
      <Icon
        size={18}
        {...props}
        aria-hidden={
          props["aria-hidden"] ?? (props["aria-label"] ? undefined : true)
        }
      />
    );
  };
}

export const AccountIcon = solid(IconUserFilled);
export const BoardIcon = solid(IconLayoutBoardFilled);
export const CollectIcon = solid(IconMessageFilled);
export const DomainIcon = solid(IconWorldFilled);
export const IntegrationIcon = solid(IconPuzzleFilled);
export const SettingIcon = solid(IconSettingsFilled);
export const Bell = solid(IconBellFilled);
export const CheckCircle = solid(IconCircleCheckFilled);
export const Clock = solid(IconClockFilled);
export const Copy = solid(IconCopyFilled);
export const ExternalLink = solid(IconExternalLinkFilled);
export const TagIcon = solid(IconTagFilled);
export const Trash2 = solid(IconTrashFilled);
export const ImageIcon = solid(IconPhotoFilled);
export const LockIcon = solid(IconLockFilled);
export const FlagIcon = solid(IconFlagFilled);
export const PlusIcon = solid(IconSquareRoundedPlusFilled);
export const ShieldIcon = solid(IconShieldCheckFilled);
export const EditIcon = solid(IconEditFilled);
export const AppearanceIcon = solid(IconPaletteFilled);
export const ArchiveIcon = solid(IconArchiveFilled);
export const BillingIcon = solid(IconCreditCardFilled);
export const DocsIcon = solid(IconFolderFilled);
export const ExportIcon = solid(IconDatabaseFilled);
const LeftPanelIcon = solid(IconLayoutSidebarFilled);
const RightPanelIcon = solid(IconLayoutSidebarRightFilled);

export function PanelIcon({
  side = "left",
  filled = true,
  size = 18,
  ...props
}: SVGProps<SVGSVGElement> & {
  size?: number | string;
  side?: "left" | "right";
  filled?: boolean;
}) {
  if (!filled) {
    return (
      <StatefulPanelIcon side={side} width={size} height={size} {...props} />
    );
  }
  const Icon = side === "right" ? RightPanelIcon : LeftPanelIcon;
  return <Icon size={size} {...props} />;
}

export const SidebarPanelIcon = PanelIcon;

export const AlertCircle = outline(LucideAlertCircle);
export const AlignLeft = outline(LucideAlignLeft);
export const ArrowBigDown = outline(LucideArrowBigDown);
export const ArrowBigUp = outline(LucideArrowBigUp);
export const ArrowLeft = outline(LucideArrowLeft);
export const ArrowRight = outline(LucideArrowRight);
export const ArrowUp = outline(LucideArrowUp);
export const CalendarCheck2 = outline(LucideCalendarCheck2);
export const CalendarDays = solid(IconCalendarFilled);
export const Camera = outline(LucideCamera);
export const Check = outline(LucideCheck);
export const ChevronDown = outline(LucideChevronDown);
export const ChevronLeft = outline(LucideChevronLeft);
export const ChevronRight = outline(LucideChevronRight);
export const ChevronsDown = outline(LucideChevronsDown);
export const ChevronsUp = outline(LucideChevronsUp);
export const ChevronsUpDown = outline(LucideChevronsUpDown);
export const ClipboardCheck = outline(LucideClipboardCheck);
export const Code2 = outline(LucideCode2);
export const EllipsisVertical = outline(LucideEllipsisVertical);
export const FileText = outline(LucideFileText);
export const FingerprintIcon = outline(LucideFingerprint);
export const History = outline(LucideHistory);
export const Link2 = outline(LucideLink2);
export const ListChecks = outline(LucideListChecks);
export const Mail = outline(LucideMail);
export const Maximize2 = outline(LucideMaximize2);
export const MessageCircleOff = LowTractionIcon;
export const MessageSquareText = outline(LucideMessageSquareText);
export const MoreHorizontal = outline(LucideMoreHorizontal);
export const MoreVertical = EllipsisVertical;
export const Paperclip = outline(LucidePaperclip);
export const Plus = outline(LucidePlus);
export const Redo2 = outline(LucideRedo2);
export const Save = outline(LucideSave);
export const Search = WorkspaceSearchIcon;
export const Sparkles = outline(LucideSparkles);
export const Square = outline(LucideSquare);
export const Undo2 = outline(LucideUndo2);
export const Upload = outline(LucideUpload);
export const UserRoundPlus = outline(LucideUserRoundPlus);
export const Wand2 = outline(LucideWand2);
export const X = outline(LucideX);

// Existing app icon names continue to work while their artwork follows the nav style.
export const SearchIcon = WorkspaceSearchIcon;

export const ArrowLeftIcon = ArrowLeft;
export const ArrowIcon = outline(LucideArrowUpRight);
export const AiIcon = Sparkles;
export const AvatarIcon = outline(LucideCircleUserRound);
export const CalendarIcon = CalendarDays;
export const CheckIcon = Check;
export const ChevronDownIcon = ChevronDown;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const CircleQuestionMarkIcon = outline(LucideCircleHelp);
export const ClipboardIcon = outline(LucideClipboard);
export const CloudIcon = outline(LucideCloud);
export const CommentsIcon = outline(LucideMessageCircle);
export const CsvIcon = outline(LucideFileSpreadsheet);
export const DocumentTextIcon = FileText;
export const FileExportIcon = outline(LucideFileUp);
export const InfoIcon = solid(IconInfoCircleFilled);
export const IdeaIcon = outline(LucideLightbulb);
export const KeyIcon = outline(LucideKeyRound);
export const ListFilterIcon = solid(IconListCheckFilled);
export const ListIcon = outline(LucideList);
export const MenuIcon = outline(LucideMenu);
export const MergeIcon = outline(LucideGitMerge);
export const MoveVerticalIcon = outline(LucideGripVertical);
export { StarIcon } from "@featul/ui/icons/star";
export const TickIcon = CheckCircle;
export const TrashIcon = Trash2;
export const UserFocusIcon = outline(LucideScanFace);
export const XMarkIcon = X;

// Semantic aliases share the same component, so artwork cannot drift between screens.
export const MemberIcon = AccountIcon;
export const BoardDialogIcon = BoardIcon;
export const TimezoneIcon = Clock;
export const Tags = TagIcon;

// Brand, status, and specialized controls retain their existing artwork.
export { LoaderIcon } from "@featul/ui/icons/loader";
export { GoogleIcon } from "@featul/ui/icons/google";
export { GitHubIcon } from "@featul/ui/icons/github";
export { IconAi } from "@tabler/icons-react";
export { ChangelogDraftIcon } from "@featul/ui/icons/changelog-draft";
export { ChangelogPublishedIcon } from "@featul/ui/icons/changelog-published";
export { NotraIcon } from "@featul/ui/icons/notra";
export { PinIcon } from "@featul/ui/icons/pin";
export { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
export { StarPinIcon } from "@featul/ui/icons/star-pin";
export { PinLockIcon } from "@featul/ui/icons/flag-merge";
export { StarLockIcon } from "@featul/ui/icons/flag-merge";
export { StarPinLockIcon } from "@featul/ui/icons/flag-merge";
export { default as PlannedIcon } from "@featul/ui/icons/planned";
export { default as ProgressIcon } from "@featul/ui/icons/progress";
export { default as ReviewIcon } from "@featul/ui/icons/review";
export { default as CompletedIcon } from "@featul/ui/icons/completed";
export { default as PendingIcon } from "@featul/ui/icons/pending";
export { default as ClosedIcon } from "@featul/ui/icons/closed";
export const ArrowUpDownIcon = solid(IconSortDescending2Filled);
export { DropdownIcon } from "@featul/ui/icons/dropdown";
export { DownloadIcon } from "@featul/ui/icons/download";
export { CannyIcon } from "@featul/ui/icons/canny";
export { NoltIcon } from "@featul/ui/icons/nolt";
export { ProductBoardIcon } from "@featul/ui/icons/productboard";
export const MaximizeIcon = Maximize2;
export { default as MinimizeIcon } from "@featul/ui/icons/minimize";
export { DiscordIcon } from "@featul/ui/icons/discord";
export { SlackIcon } from "@featul/ui/icons/slack";
export const DangerDeleteIcon = TrashIcon;
export const MoreIcon = MenuIcon;
export const ArrowBackIcon = ArrowLeft;
export { WorkspaceSwitcherIcon } from "@featul/ui/icons/workspace";
export { SelectBoxIcon } from "@featul/ui/icons/select-box";
