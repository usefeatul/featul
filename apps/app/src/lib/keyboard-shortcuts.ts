export type ShortcutBinding = {
  label?: string;
  keys: string[];
};

export type WorkspaceShortcut = {
  id: string;
  group: string;
  title: string;
  description: string;
  bindings: ShortcutBinding[];
};

export const WORKSPACE_SHORTCUTS_OPEN_EVENT = "workspace-shortcuts:open";

export const WORKSPACE_SHORTCUT_GROUP_ORDER = [
  "Global workspace",
  "Sidebar",
  "Lists and bulk actions",
  "Request detail",
  "Roadmap navigation",
] as const;

export const WORKSPACE_SHORTCUTS: WorkspaceShortcut[] = [
  {
    id: "open-shortcuts",
    group: "Global workspace",
    title: "Open keyboard shortcuts",
    description: "Open or close the shortcuts drawer from anywhere in the workspace.",
    bindings: [
      { label: "Mac", keys: ["Command", "/"] },
      { label: "Windows", keys: ["Ctrl", "/"] },
    ],
  },
  {
    id: "go-home",
    group: "Global workspace",
    title: "Open workspace home",
    description: "Jump back to the current workspace home page.",
    bindings: [
      { label: "Mac", keys: ["Command", "G"] },
      { label: "Windows", keys: ["Ctrl", "G"] },
    ],
  },
  {
    id: "create-post",
    group: "Global workspace",
    title: "Create post",
    description: "Open the create post modal when no field is focused.",
    bindings: [
      { label: "Mac", keys: ["Command", "C"] },
      { label: "Windows", keys: ["Ctrl", "C"] },
    ],
  },
  {
    id: "toggle-theme",
    group: "Global workspace",
    title: "Toggle theme",
    description: "Switch between light mode and dark mode.",
    bindings: [
      { label: "Mac", keys: ["Command", "M"] },
      { label: "Windows", keys: ["Ctrl", "M"] },
    ],
  },
  {
    id: "open-roadmap",
    group: "Sidebar",
    title: "Open Roadmap",
    description: "Navigate to the roadmap view while the desktop sidebar is hovered or focused.",
    bindings: [{ keys: ["R"] }],
  },
  {
    id: "open-changelog",
    group: "Sidebar",
    title: "Open Changelog",
    description: "Navigate to the changelog while the desktop sidebar is hovered or focused.",
    bindings: [{ keys: ["C"] }],
  },
  {
    id: "open-members",
    group: "Sidebar",
    title: "Open Members",
    description: "Navigate to the members page while the desktop sidebar is hovered or focused.",
    bindings: [{ keys: ["M"] }],
  },
  {
    id: "open-board",
    group: "Sidebar",
    title: "Open My Board",
    description: "Open the public board while the desktop sidebar is hovered or focused.",
    bindings: [{ keys: ["B"] }],
  },
  {
    id: "toggle-bulk-selection",
    group: "Lists and bulk actions",
    title: "Toggle bulk selection",
    description: "Turn multi-select mode on or off in workspace lists.",
    bindings: [
      { label: "Mac", keys: ["Command", "D"] },
      { label: "Windows", keys: ["Ctrl", "D"] },
    ],
  },
  {
    id: "bulk-delete",
    group: "Lists and bulk actions",
    title: "Delete selected items",
    description: "Open the bulk delete confirmation dialog when selection mode is active.",
    bindings: [{ keys: ["D"] }],
  },
  {
    id: "list-prev-page",
    group: "Lists and bulk actions",
    title: "Previous list page",
    description: "Go to the previous page in paginated workspace lists.",
    bindings: [{ keys: ["Z"] }],
  },
  {
    id: "list-next-page",
    group: "Lists and bulk actions",
    title: "Next list page",
    description: "Go to the next page in paginated workspace lists.",
    bindings: [{ keys: ["X"] }],
  },
  {
    id: "request-prev",
    group: "Request detail",
    title: "Previous request",
    description: "Open the previous request while viewing a request detail page.",
    bindings: [{ keys: ["Z"] }],
  },
  {
    id: "request-next",
    group: "Request detail",
    title: "Next request",
    description: "Open the next request while viewing a request detail page.",
    bindings: [{ keys: ["X"] }],
  },
  {
    id: "roadmap-prev-bracket",
    group: "Roadmap navigation",
    title: "Previous roadmap column",
    description: "Jump to the previous roadmap column.",
    bindings: [{ keys: ["["] }, { keys: ["Shift", "Left Arrow"] }],
  },
  {
    id: "roadmap-next-bracket",
    group: "Roadmap navigation",
    title: "Next roadmap column",
    description: "Jump to the next roadmap column.",
    bindings: [{ keys: ["]"] }, { keys: ["Shift", "Right Arrow"] }],
  },
  {
    id: "roadmap-first",
    group: "Roadmap navigation",
    title: "First roadmap column",
    description: "Jump straight to the first roadmap column.",
    bindings: [{ keys: ["Shift", "Home"] }],
  },
  {
    id: "roadmap-last",
    group: "Roadmap navigation",
    title: "Last roadmap column",
    description: "Jump straight to the last roadmap column.",
    bindings: [{ keys: ["Shift", "End"] }],
  },
];

export function openWorkspaceShortcutsDrawer() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WORKSPACE_SHORTCUTS_OPEN_EVENT));
}
