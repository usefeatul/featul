import type { ComponentType, SVGProps } from "react";
import {
  Archive,
  ArrowLeft,
  ChevronsUpDown,
  Globe2,
  Image,
  Layers3,
  Menu,
  PanelLeft,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideProps,
} from "lucide-react";

export type WorkspaceIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  opacity?: number;
};

function workspaceIcon(
  Icon: ComponentType<LucideProps>,
  defaultColor?: string,
) {
  function WorkspaceIcon({
    size = 18,
    color = defaultColor,
    opacity,
    ...props
  }: WorkspaceIconProps) {
    return (
      <Icon
        aria-hidden="true"
        width={size}
        height={size}
        color={color}
        opacity={opacity}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      />
    );
  }

  return WorkspaceIcon;
}

export const WorkspaceSettingsIcon = workspaceIcon(Settings);

export function WorkspaceIntegrationIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      color={color}
      opacity={opacity}
      {...props}
    >
      <g
        transform="translate(0.75 0.75) scale(0.9375)"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 3H4C3.44772 3 3 3.44772 3 4V9C3 9.55228 3.44772 10 4 10H9C9.55228 10 10 9.55228 10 9V4C10 3.44772 9.55228 3 9 3Z" />
        <path d="M20 3H15C14.4477 3 14 3.44772 14 4V9C14 9.55228 14.4477 10 15 10H20C20.5523 10 21 9.55228 21 9V4C21 3.44772 20.5523 3 20 3Z" />
        <path d="M20 14H15C14.4477 14 14 14.4477 14 15V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V15C21 14.4477 20.5523 14 20 14Z" />
        <path d="M9 14H4C3.44772 14 3 14.4477 3 15V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V15C10 14.4477 9.55228 14 9 14Z" />
      </g>
    </svg>
  );
}

export function WorkspaceBoardIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="4.25" cy="5.25" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="6.75" cy="5.25" r="0.75" fill="currentColor" stroke="none" />
      <path d="M1.75 7.75H16.25" />
      <path d="M16.25 9.44788V4.75C16.25 3.65 15.355 2.75 14.25 2.75H3.75C2.645 2.75 1.75 3.65 1.75 4.75V13.25C1.75 14.35 2.645 15.25 3.75 15.25H9.0779" />
      <path d="M11.126 10.7701L17.066 12.94C17.316 13.0301 17.309 13.39 17.055 13.4699L14.336 14.3399L13.466 17.0601C13.385 17.3101 13.028 17.32 12.937 17.07L10.767 11.13C10.685 10.9 10.902 10.69 11.126 10.7701Z" />
    </svg>
  );
}

export function WorkspaceDocsIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      color={color}
      opacity={opacity}
      {...props}
    >
      <g
        transform="translate(0.75 0.75) scale(0.9375)"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 10H22M20 20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6H12.1C11.7655 6.00328 11.4355 5.92261 11.1403 5.76538C10.8451 5.60815 10.594 5.37938 10.41 5.1L9.6 3.9C9.41789 3.62347 9.16997 3.39648 8.8785 3.2394C8.58702 3.08231 8.26111 3.00005 7.93 3H4C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20Z" />
      </g>
    </svg>
  );
}

export function WorkspaceRoadmapIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      color={color}
      opacity={opacity}
      {...props}
    >
      <g
        transform="translate(0.75 0.75) scale(0.9375)"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 3.23608C8.68967 3.23608 8.3836 3.3083 8.106 3.44702L3.553 5.72402C3.38692 5.80701 3.24722 5.93459 3.14956 6.09249C3.05189 6.25039 3.0001 6.43235 3 6.61802V19.381C2.99958 19.5517 3.04284 19.7196 3.12565 19.8688C3.20846 20.018 3.32808 20.1435 3.47312 20.2334C3.61816 20.3233 3.78379 20.3746 3.95426 20.3824C4.12473 20.3902 4.29436 20.3543 4.447 20.278L8.106 18.448C8.3836 18.3093 8.68967 18.2371 9 18.2371C9.31033 18.2371 9.6164 18.3093 9.894 18.448L14.106 20.554C14.3836 20.6927 14.6897 20.7649 15 20.7649C15.3103 20.7649 15.6164 20.6927 15.894 20.554L20.447 18.277C20.6131 18.194 20.7528 18.0664 20.8505 17.9085C20.9481 17.7506 20.9999 17.5687 21 17.383V4.61902C21.0003 4.44846 20.9569 4.28067 20.874 4.1316C20.7911 3.98253 20.6715 3.85714 20.5265 3.76735C20.3814 3.67755 20.2159 3.62634 20.0455 3.61858C19.8751 3.61083 19.7056 3.64678 19.553 3.72302L15.894 5.55302C15.6164 5.69173 15.3103 5.76395 15 5.76395C14.6897 5.76395 14.3836 5.69173 14.106 5.55302L9.894 3.44702C9.6164 3.3083 9.31033 3.23608 9 3.23608ZM15 5.76395V20.7639M9 3.23608V18.2361" />
      </g>
    </svg>
  );
}

export function WorkspaceChangelogIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8.805 10.75L9.787 15.397C9.901 15.937 9.556 16.468 9.015 16.582L8.037 16.789C7.497 16.903 6.966 16.558 6.852 16.017L5.75 10.75" />
      <path d="M13.75 13.25C13.75 13.25 11.813 10.75 9.5 10.75H5C3.205 10.75 1.75 9.295 1.75 7.5C1.75 5.705 3.205 4.25 5 4.25H9.5C11.812 4.25 13.75 1.75 13.75 1.75V13.25Z" />
      <path d="M5.75 4.25V10.75" />
      <path d="M16.3843 6C16.9018 6.2995 17.25 6.8591 17.25 7.5C17.25 8.1409 16.9018 8.7005 16.3843 9" />
    </svg>
  );
}

export function WorkspaceMembersIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="4.5" r="2.75" />
      <path d="M13.762 15.516C14.622 15.245 15.074 14.295 14.709 13.471C13.739 11.28 11.55 9.75 9 9.75C6.45 9.75 4.261 11.28 3.291 13.471C2.926 14.296 3.378 15.245 4.238 15.516C5.463 15.902 7.084 16.25 9 16.25C10.916 16.25 12.537 15.902 13.762 15.516Z" />
    </svg>
  );
}

export const WorkspaceImageIcon = workspaceIcon(Image);
export const WorkspaceDomainIcon = workspaceIcon(Globe2);
export const WorkspaceArchiveIcon = workspaceIcon(Archive);
export const WorkspaceAccountIcon = workspaceIcon(UserRound);
export const WorkspaceSecurityIcon = workspaceIcon(ShieldCheck);
export const WorkspaceAppearanceIcon = workspaceIcon(Layers3);

export function WorkspaceFeedbackIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="6.75" cy="7.563" r="0.75" fill="currentColor" stroke="none" />
      <circle
        cx="6.75"
        cy="10.437"
        r="0.75"
        fill="currentColor"
        stroke="none"
      />
      <path d="M14.25 3.75H8.25C8.25 4.578 7.578 5.25 6.75 5.25C5.922 5.25 5.25 4.578 5.25 3.75H3.75C2.645 3.75 1.75 4.646 1.75 5.75V12.25C1.75 13.354 2.645 14.25 3.75 14.25H5.25C5.25 13.422 5.922 12.75 6.75 12.75C7.578 12.75 8.25 13.422 8.25 14.25H14.25C15.355 14.25 16.25 13.354 16.25 12.25V5.75C16.25 4.646 15.355 3.75 14.25 3.75Z" />
    </svg>
  );
}

export function WorkspaceExportIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.25 7.75V4.75C2.25 3.645 3.145 2.75 4.25 2.75H6.201C6.808 2.75 7.381 3.025 7.761 3.498L8.364 4.25H13.75C14.855 4.25 15.75 5.145 15.75 6.25V7.75" />
      <path d="M2.702 7.75H15.298C16.284 7.75 17.001 8.684 16.747 9.636L15.646 13.765C15.413 14.641 14.62 15.25 13.714 15.25H4.287C3.381 15.25 2.588 14.641 2.355 13.765L1.254 9.636C1 8.684 1.717 7.75 2.702 7.75Z" />
    </svg>
  );
}

export function WorkspaceBillingIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1.75 7.25H16.25" />
      <rect x="1.75" y="3.75" width="14.5" height="10.5" rx="2" />
      <path d="M4.25 11.25H7.25M12.75 11.25H13.75" />
    </svg>
  );
}

export const WorkspaceBackIcon = workspaceIcon(ArrowLeft);
export function WorkspaceCreateIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.533 5.437L6.202 2.106C5.811 1.715 5.178 1.715 4.788 2.106L2.106 4.788C1.715 5.179 1.715 5.812 2.106 6.202L5.437 9.533" />
      <path d="M8.467 12.563L11.798 15.894C12.189 16.285 12.822 16.285 13.212 15.894L15.894 13.212C16.285 12.821 16.285 12.188 15.894 11.798L14.685 10.589" />
      <path d="M3.416 7.513L5.184 5.745M10.487 14.584L12.255 12.816" />
      <path d="M2.25 15.75C2.25 15.75 5.849 15.182 6.796 14.235C7.743 13.288 15.373 5.658 15.373 5.658C16.21 4.821 16.21 3.464 15.373 2.628C14.536 1.791 13.179 1.791 12.343 2.628C12.343 2.628 4.713 10.258 3.766 11.205C2.819 12.152 2.251 15.751 2.251 15.751L2.25 15.75Z" />
      <path d="M11.121 3.848L14.152 6.879" />
    </svg>
  );
}
export const WorkspacePanelIcon = workspaceIcon(PanelLeft);
export function WorkspaceTimerIcon({
  size = 18,
  color,
  opacity,
  ...props
}: WorkspaceIconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      color={color}
      opacity={opacity}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 4.25V1.75C13.004 1.75 16.25 4.996 16.25 9C16.25 13.004 13.004 16.25 9 16.25C4.996 16.25 1.75 13.004 1.75 9C1.75 6.998 2.561 5.185 3.873 3.873" />
      <path d="M9 9L6 6" />
    </svg>
  );
}
export const WorkspaceMoreIcon = workspaceIcon(Menu);
export const WorkspaceSearchIcon = workspaceIcon(Search);
export const WorkspaceSwitcherIcon = workspaceIcon(ChevronsUpDown);
