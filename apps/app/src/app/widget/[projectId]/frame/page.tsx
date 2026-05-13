import WidgetFrame from "@/components/widget/frame";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{
    parentOrigin?: string;
    theme?: "light" | "dark" | "auto";
    section?: "home" | "feedback" | "roadmap" | "changelog";
  }>;
};

export default async function WidgetFramePage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = (await searchParams) || {};

  return (
    <WidgetFrame
      projectId={projectId}
      parentOrigin={sp.parentOrigin || ""}
      initialTheme={sp.theme || "auto"}
      initialSection={sp.section || "home"}
    />
  );
}
