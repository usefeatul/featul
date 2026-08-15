import WidgetFrame from "@/components/widget/frame";
import { isSafeParentOrigin } from "@/components/widget/origin";

export const dynamic = "force-dynamic";

const THEMES = ["light", "dark", "auto"] as const;
const SECTIONS = ["home", "feedback", "roadmap", "changelog"] as const;
const POSITIONS = ["left", "right"] as const;

type Theme = (typeof THEMES)[number];
type Section = (typeof SECTIONS)[number];
type Position = (typeof POSITIONS)[number];

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{
    parentOrigin?: string;
    theme?: string;
    section?: string;
    position?: string;
  }>;
};

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function isSafeProjectId(value: string) {
  return /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}

export default async function WidgetFramePage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = (await searchParams) || {};

  if (!isSafeProjectId(projectId)) return null;

  const parentOrigin = isSafeParentOrigin(sp.parentOrigin) ? sp.parentOrigin : "";

  return (
    <WidgetFrame
      projectId={projectId}
      parentOrigin={parentOrigin}
      initialTheme={pick<Theme>(sp.theme, THEMES, "auto")}
      initialSection={pick<Section>(sp.section, SECTIONS, "home")}
      initialPosition={pick<Position>(sp.position, POSITIONS, "right")}
    />
  );
}
