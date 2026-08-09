import React from "react";

type ThemePreviewPalette = {
  canvas: string;
  sidebar: string;
  logo: string;
  profileCard: string;
  primaryText: string;
  secondaryText: string;
  badge: string;
  workspaceText: string;
  actionButton: string;
  divider: string;
  listText: string;
  listDate: string;
  listAvatar: string;
  title: string;
};

type ThemePreviewSceneProps = {
  palette: ThemePreviewPalette;
  clipPath?: string;
};

const navDotColors = [
  "#F59E0B",
  "#3B82F6",
  "#A855F7",
  "#22C55E",
  "#71717A",
  "#EF4444",
];

const navTextWidths = [24, 26, 22, 25, 23, 20];
const workspaceTextWidths = [28, 30, 26];
const listRows = [
  { y: 36, dot: "#71717A", width: 100 },
  { y: 58, dot: "#71717A", width: 80 },
  { y: 80, dot: "#A855F7", width: 90 },
  { y: 102, dot: "#3B82F6", width: 110 },
  { y: 124, dot: "#22C55E", width: 95 },
  { y: 146, dot: "#71717A", width: 70 },
  { y: 168, dot: "#A855F7", width: 85 },
];

export const lightThemePreviewPalette: ThemePreviewPalette = {
  canvas: "#FFFFFF",
  sidebar: "#FAFAFA",
  logo: "#18181B",
  profileCard: "#F4F4F5",
  primaryText: "#27272A",
  secondaryText: "#A1A1AA",
  badge: "#E4E4E7",
  workspaceText: "#71717A",
  actionButton: "#F4F4F5",
  divider: "#F4F4F5",
  listText: "#27272A",
  listDate: "#A1A1AA",
  listAvatar: "#E4E4E7",
  title: "#18181B",
};

export const darkThemePreviewPalette: ThemePreviewPalette = {
  canvas: "#09090B",
  sidebar: "#18181B",
  logo: "#FAFAFA",
  profileCard: "#27272A",
  primaryText: "#E4E4E7",
  secondaryText: "#71717A",
  badge: "#3F3F46",
  workspaceText: "#52525B",
  actionButton: "#27272A",
  divider: "#27272A",
  listText: "#3F3F46",
  listDate: "#52525B",
  listAvatar: "#3F3F46",
  title: "#FAFAFA",
};

export function ThemePreviewScene({
  palette,
  clipPath,
}: ThemePreviewSceneProps) {
  const groupProps = clipPath ? { clipPath: `url(#${clipPath})` } : undefined;

  return (
    <g {...groupProps}>
      <rect width="282" height="193" rx="12" fill={palette.canvas} />
      <rect width="66" height="193" fill={palette.sidebar} />

      <circle cx="14" cy="14" r="5" fill={palette.logo} />
      <rect x="24" y="11" width="30" height="6" rx="2" fill={palette.logo} />

      <rect
        x="8"
        y="28"
        width="50"
        height="18"
        rx="4"
        fill={palette.profileCard}
      />
      <rect x="12" y="32" width="10" height="10" rx="3" fill="#FB923C" />
      <rect
        x="26"
        y="33"
        width="24"
        height="3"
        rx="1.5"
        fill={palette.primaryText}
      />
      <rect
        x="26"
        y="39"
        width="16"
        height="3"
        rx="1.5"
        fill={palette.secondaryText}
      />

      <rect
        x="8"
        y="52"
        width="50"
        height="10"
        rx="2"
        fill={palette.profileCard}
      />
      <rect x="32" y="55" width="22" height="4" rx="1" fill={palette.logo} />

      <rect
        x="8"
        y="68"
        width="20"
        height="3"
        rx="1.5"
        fill={palette.secondaryText}
      />

      {navDotColors.map((color, index) => {
        const y = 78 + index * 10;
        return (
          <g key={`${color}-${y}`} opacity="0.8">
            <circle cx="12" cy={y} r="3" fill={color} />
            <rect
              x="19"
              y={y - 2}
              width={navTextWidths[index]}
              height="4"
              rx="2"
              fill="#52525B"
            />
            <rect
              x="49"
              y={y - 2}
              width="9"
              height="4"
              rx="1"
              fill={palette.badge}
            />
          </g>
        );
      })}

      <rect
        x="8"
        y="142"
        width="24"
        height="3"
        rx="1.5"
        fill={palette.secondaryText}
      />

      {workspaceTextWidths.map((width, index) => {
        const y = 152 + index * 12;
        return (
          <React.Fragment key={`${width}-${y}`}>
            <rect
              x="12"
              y={y}
              width="6"
              height="6"
              rx="1"
              fill={palette.secondaryText}
            />
            <rect
              x="24"
              y={y + 1}
              width={width}
              height="4"
              rx="2"
              fill={palette.workspaceText}
            />
          </React.Fragment>
        );
      })}

      <text
        x="76"
        y="20"
        fontFamily="sans-serif"
        fontSize="10"
        fontWeight="600"
        fill={palette.title}
      >
        Requests
      </text>

      <rect
        x="216"
        y="10"
        width="14"
        height="14"
        rx="3"
        fill={palette.actionButton}
      />
      <rect
        x="234"
        y="10"
        width="14"
        height="14"
        rx="3"
        fill={palette.actionButton}
      />
      <rect
        x="252"
        y="10"
        width="14"
        height="14"
        rx="3"
        fill={palette.actionButton}
      />

      <line x1="66" y1="0" x2="66" y2="193" stroke={palette.divider} />

      {listRows.map((row, index) => (
        <g key={`${row.y}-${row.width}`} transform={`translate(76, ${row.y})`}>
          <circle cx="8" cy="8" r="4" fill={row.dot} />
          <rect
            x="20"
            y="6"
            width={row.width}
            height="4"
            rx="2"
            fill={palette.listText}
          />
          <rect
            x="156"
            y="6"
            width="18"
            height="4"
            rx="1"
            fill={palette.listDate}
          />
          <circle cx="186" cy="8" r="4" fill={palette.listAvatar} />
          {index < listRows.length - 1 ? (
            <line x1="0" y1="18" x2="190" y2="18" stroke={palette.divider} />
          ) : null}
        </g>
      ))}
    </g>
  );
}
