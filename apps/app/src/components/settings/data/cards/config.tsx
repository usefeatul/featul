import type { ComponentType } from "react";
import {
  CannyIcon,
  NoltIcon,
  ProductBoardIcon,
  CsvIcon,
  FileExportIcon,
} from "@/components/global/icons";

type DataCardContext = {
  allowProviderImports: boolean;
};

export type DataCardAction = "openImportDialog" | "openExportDialog" | "none";

export type DataCardConfig = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  description: (ctx: DataCardContext) => string;
  buttonLabel: (ctx: DataCardContext) => string;
  action: DataCardAction;
  disabled?: boolean;
};

export const importCardConfigs: DataCardConfig[] = [
  {
    id: "import-csv",
    icon: CsvIcon,
    iconClassName: "w-5 h-5 text-primary",
    title: "Import from CSV",
    description: () =>
      "Import your feature requests, boards, and users from a CSV file.",
    buttonLabel: () => "Import",
    action: "openImportDialog",
  },
  {
    id: "import-canny",
    icon: CannyIcon,
    iconClassName: "w-5 h-5",
    title: "Import from Canny",
    description: ({ allowProviderImports }) =>
      allowProviderImports
        ? "Import your feedback, feature requests, and comments directly from Canny."
        : "Import your feedback, feature requests, and comments directly from Canny. Available on paid plans.",
    buttonLabel: ({ allowProviderImports }) =>
      allowProviderImports ? "Soon" : "Paid (Soon)",
    action: "none",
    disabled: true,
  },
  {
    id: "import-productboard",
    icon: ProductBoardIcon,
    iconClassName: "w-5 h-5",
    title: "Import from ProductBoard",
    description: ({ allowProviderImports }) =>
      allowProviderImports
        ? "Import your posts, boards, and comments directly from ProductBoard."
        : "Import your posts, boards, and comments directly from ProductBoard. Available on paid plans.",
    buttonLabel: ({ allowProviderImports }) =>
      allowProviderImports ? "Soon" : "Paid (Soon)",
    action: "none",
    disabled: true,
  },
  {
    id: "import-nolt",
    icon: NoltIcon,
    iconClassName: "w-5 h-5",
    title: "Import from Nolt",
    description: ({ allowProviderImports }) =>
      allowProviderImports
        ? "Import your feedback, feature requests, and comments directly from Nolt."
        : "Import your feedback, feature requests, and comments directly from Nolt. Available on paid plans.",
    buttonLabel: ({ allowProviderImports }) =>
      allowProviderImports ? "Soon" : "Paid (Soon)",
    action: "none",
    disabled: true,
  },
];

export const exportCardConfigs: DataCardConfig[] = [
  {
    id: "export-csv",
    icon: FileExportIcon,
    iconClassName: "w-5 h-5 text-primary",
    title: "Export to CSV",
    description: () =>
      "Export all your feedback submissions and their details to a downloadable CSV file.",
    buttonLabel: () => "Export",
    action: "openExportDialog",
  },
];
