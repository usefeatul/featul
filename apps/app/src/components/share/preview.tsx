import { cn } from "@featul/ui/lib/utils";
import StatusIcon from "@/components/requests/StatusIcon";
import { normalizeRoadmapStatus, statusLabel } from "@/lib/roadmap";

export type PreviewPost = {
  id: string;
  title: string;
  upvotes: number | null;
  commentCount: number | null;
  roadmapStatus: string | null;
};

const samplePosts: PreviewPost[] = [
  {
    id: "sample-1",
    title: "Export reports to CSV",
    upvotes: 48,
    commentCount: 12,
    roadmapStatus: "planned",
  },
  {
    id: "sample-2",
    title: "Dark mode for dashboards",
    upvotes: 31,
    commentCount: 8,
    roadmapStatus: "progress",
  },
  {
    id: "sample-3",
    title: "Slack notifications",
    upvotes: 19,
    commentCount: 3,
    roadmapStatus: "completed",
  },
];

export default function BoardPreview({
  name,
  logo,
  displayUrl,
  posts,
}: {
  name: string;
  logo?: string | null;
  displayUrl: string;
  posts: PreviewPost[];
}) {
  const items = posts.length ? posts : samplePosts;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-black/10 bg-card shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#151515]">
      <div className="flex items-center gap-3 border-b border-border/50 px-3 py-2 dark:border-white/8">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
        </span>
        <span className="mx-auto min-w-0 truncate rounded-md bg-muted/60 px-3 py-0.5 text-[10px] text-accent dark:bg-white/5">
          {displayUrl}
        </span>
        <span className="w-[2.375rem]" />
      </div>
      <div className="flex items-center gap-2 px-3 pt-3 text-xs font-medium">
        {logo ? (
          <img src={logo} alt="" className="size-4 rounded object-cover" />
        ) : (
          <span className="flex size-4 items-center justify-center rounded bg-primary text-[9px] font-semibold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="truncate">{name}</span>
        <span className="ml-auto shrink-0 rounded-md bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
          Submit idea
        </span>
      </div>
      <div className="mt-2 flex gap-3 border-b border-border/50 px-3 text-[10px] text-accent dark:border-white/8">
        <span className="border-b border-primary pb-1.5 font-medium text-foreground">
          Feedback
        </span>
        <span className="pb-1.5">Roadmap</span>
        <span className="pb-1.5">Changelog</span>
      </div>
      <ul className="divide-y divide-border/40 dark:divide-white/5">
        {items.map((item, index) => {
          const status = normalizeRoadmapStatus(item.roadmapStatus);
          return (
            <li key={item.id} className="flex items-center gap-2.5 px-3 py-2">
              <span
                className={cn(
                  "flex w-7 shrink-0 flex-col items-center rounded-md border py-0.5 text-[10px] leading-tight tabular-nums",
                  index === 0
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 text-accent dark:border-white/10",
                )}
              >
                <span aria-hidden className="text-[8px]">
                  ▲
                </span>
                {item.upvotes ?? 0}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.commentCount ?? 0} comments
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[10px] text-accent">
                <StatusIcon status={status} className="size-3" />
                {statusLabel(status)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
