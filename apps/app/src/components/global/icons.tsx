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
  Bell as LucideBell,
  CalendarCheck2 as LucideCalendarCheck2,
  CalendarDays as LucideCalendarDays,
  Camera as LucideCamera,
  Check as LucideCheck,
  CheckCircle as LucideCheckCircle,
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
  Clock as LucideClock,
  Clock3 as LucideClock3,
  Cloud as LucideCloud,
  Code2 as LucideCode2,
  Copy as LucideCopy,
  EllipsisVertical as LucideEllipsisVertical,
  ExternalLink as LucideExternalLink,
  FileSpreadsheet as LucideFileSpreadsheet,
  FileText as LucideFileText,
  FileUp as LucideFileUp,
  Filter as LucideFilter,
  Fingerprint as LucideFingerprint,
  Flag as LucideFlag,
  GitMerge as LucideGitMerge,
  GripVertical as LucideGripVertical,
  History as LucideHistory,
  House as LucideHouse,
  Image as LucideImage,
  Info as LucideInfo,
  KeyRound as LucideKeyRound,
  Lightbulb as LucideLightbulb,
  Link2 as LucideLink2,
  List as LucideList,
  ListChecks as LucideListChecks,
  ListFilter as LucideListFilter,
  LockKeyhole as LucideLockKeyhole,
  LogOut as LucideLogOut,
  Mail as LucideMail,
  Maximize2 as LucideMaximize2,
  Menu as LucideMenu,
  MessageCircle as LucideMessageCircle,
  MessageCircleOff as LucideMessageCircleOff,
  MessageSquareText as LucideMessageSquareText,
  MoreHorizontal as LucideMoreHorizontal,
  MoreVertical as LucideMoreVertical,
  Paperclip as LucidePaperclip,
  Pencil as LucidePencil,
  Plus as LucidePlus,
  Redo2 as LucideRedo2,
  Save as LucideSave,
  ScanFace as LucideScanFace,
  Search as LucideSearch,
  Share2 as LucideShare2,
  ShieldCheck as LucideShieldCheck,
  Sparkles as LucideSparkles,
  Square as LucideSquare,
  SquarePlus as LucideSquarePlus,
  Star as LucideStar,
  Tags as LucideTags,
  Trash2 as LucideTrash2,
  Undo2 as LucideUndo2,
  Upload as LucideUpload,
  UserRoundPlus as LucideUserRoundPlus,
  Wand2 as LucideWand2,
  X as LucideX,
} from "lucide-react";
import type { ComponentType } from "react";
import { PanelIcon as StatefulPanelIcon } from "@featul/ui/icons/panel";
import {
  WorkspaceAccountIcon,
  WorkspaceBoardIcon,
  WorkspaceChangelogIcon,
  WorkspaceDomainIcon,
  WorkspaceFeedbackIcon,
  WorkspaceIntegrationIcon,
  WorkspaceMembersIcon,
  WorkspaceRoadmapIcon,
  WorkspaceSearchIcon,
  WorkspaceSettingsIcon,
} from "@featul/ui/icons/workspace";

/** Keep app actions at the same 18px, 1.5px outline weight as workspace navigation. */
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

export const AlertCircle = outline(LucideAlertCircle);
export const AlignLeft = outline(LucideAlignLeft);
export const ArrowBigDown = outline(LucideArrowBigDown);
export const ArrowBigUp = outline(LucideArrowBigUp);
export const ArrowLeft = outline(LucideArrowLeft);
export const ArrowRight = outline(LucideArrowRight);
export const ArrowUp = outline(LucideArrowUp);
export const Bell = outline(LucideBell);
export const CalendarCheck2 = outline(LucideCalendarCheck2);
export const CalendarDays = outline(LucideCalendarDays);
export const Camera = outline(LucideCamera);
export const Check = outline(LucideCheck);
export const CheckCircle = outline(LucideCheckCircle);
export const ChevronDown = outline(LucideChevronDown);
export const ChevronLeft = outline(LucideChevronLeft);
export const ChevronRight = outline(LucideChevronRight);
export const ChevronsDown = outline(LucideChevronsDown);
export const ChevronsUp = outline(LucideChevronsUp);
export const ChevronsUpDown = outline(LucideChevronsUpDown);
export const ClipboardCheck = outline(LucideClipboardCheck);
export const Clock = outline(LucideClock);
export const Code2 = outline(LucideCode2);
export const Copy = outline(LucideCopy);
export const EllipsisVertical = outline(LucideEllipsisVertical);
export const ExternalLink = outline(LucideExternalLink);
export const FileText = outline(LucideFileText);
export const FingerprintIcon = outline(LucideFingerprint);
export const History = outline(LucideHistory);
export const Link2 = outline(LucideLink2);
export const ListChecks = outline(LucideListChecks);
export const Mail = outline(LucideMail);
export const Maximize2 = outline(LucideMaximize2);
export const MessageCircleOff = outline(LucideMessageCircleOff);
export const MessageSquareText = outline(LucideMessageSquareText);
export const MoreHorizontal = outline(LucideMoreHorizontal);
export const MoreVertical = outline(LucideMoreVertical);
export const Paperclip = outline(LucidePaperclip);
export const Plus = outline(LucidePlus);
export const Redo2 = outline(LucideRedo2);
export const Save = outline(LucideSave);
export const Search = outline(LucideSearch);
export const Sparkles = outline(LucideSparkles);
export const Square = outline(LucideSquare);
export const Tags = outline(LucideTags);
export const Trash2 = outline(LucideTrash2);
export const Undo2 = outline(LucideUndo2);
export const Upload = outline(LucideUpload);
export const UserRoundPlus = outline(LucideUserRoundPlus);
export const Wand2 = outline(LucideWand2);
export const X = outline(LucideX);

// Existing app icon names continue to work while their artwork follows the nav style.
export const AccountIcon = WorkspaceAccountIcon;
export const BoardIcon = WorkspaceBoardIcon;
export const ChangelogIcon = WorkspaceChangelogIcon;
export const CollectIcon = WorkspaceFeedbackIcon;
export const DomainIcon = WorkspaceDomainIcon;
export const IntegrationIcon = WorkspaceIntegrationIcon;
export const MemberIcon = WorkspaceMembersIcon;
export const PanelIcon = StatefulPanelIcon;
export const RoadmapIcon = WorkspaceRoadmapIcon;
export const SearchIcon = WorkspaceSearchIcon;
export const SettingIcon = WorkspaceSettingsIcon;

export const ArrowLeftIcon = ArrowLeft;
export const ArrowIcon = outline(LucideArrowUpRight);
export const AiIcon = Sparkles;
export const AvatarIcon = outline(LucideCircleUserRound);
export const BoardDialogIcon = WorkspaceBoardIcon;
export const CalendarIcon = outline(LucideCalendarDays);
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
export const EditIcon = outline(LucidePencil);
export const FileExportIcon = outline(LucideFileUp);
export const FilterIcon = outline(LucideFilter);
export const FlagIcon = outline(LucideFlag);
export const HomeIcon = outline(LucideHouse);
export const ImageIcon = outline(LucideImage);
export const InfoIcon = outline(LucideInfo);
export const IdeaIcon = outline(LucideLightbulb);
export const KeyIcon = outline(LucideKeyRound);
export const ListFilterIcon = outline(LucideListFilter);
export const ListIcon = outline(LucideList);
export const LockIcon = outline(LucideLockKeyhole);
export const LogoutIcon = outline(LucideLogOut);
export const MenuIcon = outline(LucideMenu);
export const MergeIcon = outline(LucideGitMerge);
export const MoveVerticalIcon = outline(LucideGripVertical);
export const PlusIcon = outline(LucideSquarePlus);
export const ShareIcon = outline(LucideShare2);
export const ShieldIcon = outline(LucideShieldCheck);
export const StarIcon = outline(LucideStar);
export const TimezoneIcon = outline(LucideClock3);
export const TickIcon = CheckCircle;
export const TrashIcon = Trash2;
export const UserFocusIcon = outline(LucideScanFace);
export const XMarkIcon = X;
