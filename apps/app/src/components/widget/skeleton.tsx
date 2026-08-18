"use client";

import { cn } from "@featul/ui/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[rgb(var(--widget-fg)/0.08)]",
        className,
      )}
      aria-hidden
    />
  );
}

function range(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

export function WidgetPostRowSkeleton() {
  return (
    <div className="border-b border-[rgb(var(--widget-fg)/0.1)] px-4 py-3.5 last:border-b-0">
      <div className="flex items-start gap-3">
        <Bone className="mt-0.5 size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Bone className="h-4 w-[78%] rounded-full" />
          <Bone className="mt-2 h-3 w-full rounded-full" />
          <Bone className="mt-1.5 h-3 w-[62%] rounded-full" />
          <div className="mt-2.5 flex items-center gap-2">
            <Bone className="h-2.5 w-14 rounded-full" />
            <Bone className="h-2.5 w-10 rounded-full" />
            <Bone className="h-2.5 w-16 rounded-full" />
          </div>
        </div>
        <Bone className="h-8 w-8 shrink-0 rounded-md" />
      </div>
    </div>
  );
}

export function WidgetFeedbackListSkeleton({
  rows = 6,
  withToolbar = false,
}: {
  rows?: number;
  withToolbar?: boolean;
}) {
  return (
    <div aria-busy="true" aria-label="Loading feedback">
      {withToolbar ? (
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          <Bone className="h-9 min-w-0 flex-1 rounded-md" />
          <Bone className="size-9 shrink-0 rounded-md" />
          <Bone className="size-9 shrink-0 rounded-md" />
        </div>
      ) : null}
      {range(rows).map((index) => (
        <WidgetPostRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function WidgetRoadmapRowSkeleton() {
  return (
    <div className="border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-3.5 last:border-b-0">
      <div className="flex items-center gap-3">
        <Bone className="size-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Bone className="h-3.5 w-[70%] rounded-full" />
          <Bone className="mt-2 h-2.5 w-20 rounded-full" />
        </div>
        <Bone className="h-8 w-8 shrink-0 rounded-md" />
      </div>
    </div>
  );
}

export function WidgetRoadmapSkeleton() {
  return (
    <div className="pb-8" aria-busy="true" aria-label="Loading roadmap">
      {(["w-24", "w-20", "w-14"] as const).map((width, section) => (
        <section key={section}>
          <div className="flex h-11 items-center gap-2 border-b border-[rgb(var(--widget-fg)/0.1)] px-5">
            <Bone className="size-4 shrink-0 rounded-full" />
            <Bone className={cn("h-3.5 rounded-full", width)} />
            <Bone className="ml-auto h-3 w-6 rounded-full" />
          </div>
          {range(3).map((index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-2.5">
              <Bone className="size-4 shrink-0 rounded-full" />
              <Bone className="h-3.5 w-[72%] rounded-full" />
              <Bone className="ml-auto h-8 w-8 shrink-0 rounded-md" />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export function WidgetUpdateRowSkeleton() {
  return (
    <div className="border-t border-dashed border-[rgb(var(--widget-fg)/0.12)] px-5 py-5 first:border-t-0">
      <div className="flex items-center gap-2">
        <Bone className="h-2.5 w-16 rounded-full" />
        <Bone className="h-2.5 w-20 rounded-full" />
      </div>
      <Bone className="mt-3 h-5 w-[88%] rounded-full" />
      <Bone className="mt-3 h-3 w-full rounded-full" />
      <Bone className="mt-1.5 h-3 w-[74%] rounded-full" />
      <div className="mt-4 flex items-center gap-2.5">
        <Bone className="size-7 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Bone className="h-3 w-24 rounded-full" />
          <Bone className="mt-1.5 h-2.5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function WidgetUpdatesSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading updates">
      {range(rows).map((index) => (
        <WidgetUpdateRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function WidgetHomeSkeleton({
  featured = true,
  roadmap = true,
  updates = true,
}: {
  featured?: boolean;
  roadmap?: boolean;
  updates?: boolean;
}) {
  return (
    <div className="space-y-0" aria-busy="true" aria-label="Loading">
      {featured ? (
        <div className="border-b border-[rgb(var(--widget-fg)/0.1)] px-5 pb-6">
          <div className="flex items-center gap-2">
            <Bone className="h-2.5 w-16 rounded-full" />
            <Bone className="h-2.5 w-24 rounded-full" />
          </div>
          <Bone className="mt-3 h-6 w-[92%] rounded-full" />
          <Bone className="mt-2 h-6 w-[64%] rounded-full" />
          <Bone className="mt-3 h-3.5 w-full rounded-full" />
          <Bone className="mt-1.5 h-3.5 w-[80%] rounded-full" />
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Bone className="size-7 shrink-0 rounded-full" />
              <div>
                <Bone className="h-3 w-24 rounded-full" />
                <Bone className="mt-1.5 h-2.5 w-12 rounded-full" />
              </div>
            </div>
            <Bone className="h-3 w-20 rounded-full" />
          </div>
        </div>
      ) : null}

      <div className="border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-5">
        <div className="flex items-center gap-3 rounded-md bg-[rgb(var(--widget-fg)/0.03)] px-3.5 py-3.5">
          <Bone className="size-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1">
            <Bone className="h-3.5 w-28 rounded-full" />
            <Bone className="mt-2 h-2.5 w-40 rounded-full" />
          </div>
          <Bone className="size-4 shrink-0 rounded-full" />
        </div>
      </div>

      {roadmap ? (
        <section className="border-b border-[rgb(var(--widget-fg)/0.1)] py-5">
          <div className="mb-3 flex items-center justify-between gap-3 px-5">
            <div className="flex items-center gap-2">
              <Bone className="size-3.5 rounded-full" />
              <Bone className="h-2.5 w-20 rounded-full" />
            </div>
            <Bone className="h-2.5 w-24 rounded-full" />
          </div>
          {range(4).map((index) => (
            <WidgetRoadmapRowSkeleton key={index} />
          ))}
        </section>
      ) : null}

      {updates ? (
        <section className="py-5">
          <div className="mb-3 flex items-center justify-between gap-3 px-5">
            <Bone className="h-2.5 w-16 rounded-full" />
            <Bone className="h-2.5 w-24 rounded-full" />
          </div>
          {range(3).map((index) => (
            <div
              key={index}
              className="flex flex-col gap-1.5 border-b border-[rgb(var(--widget-fg)/0.1)] px-5 py-3.5 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Bone className="h-2.5 w-14 rounded-full" />
                <Bone className="h-2.5 w-16 rounded-full" />
              </div>
              <Bone className="mt-1 h-3.5 w-[82%] rounded-full" />
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export function WidgetDetailSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label="Loading request">
      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center gap-2.5">
          <Bone className="size-8 shrink-0 rounded-full" />
          <div>
            <Bone className="h-3.5 w-24 rounded-full" />
            <Bone className="mt-1.5 h-2.5 w-14 rounded-full" />
          </div>
        </div>
        <Bone className="mt-4 h-6 w-[90%] rounded-full" />
        <Bone className="mt-2 h-6 w-[58%] rounded-full" />
        <Bone className="mt-4 h-3.5 w-full rounded-full" />
        <Bone className="mt-2 h-3.5 w-full rounded-full" />
        <Bone className="mt-2 h-3.5 w-[70%] rounded-full" />
        <div className="mt-5 flex items-center justify-between">
          <Bone className="h-3.5 w-20 rounded-full" />
          <Bone className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="border-t border-dashed border-[rgb(var(--widget-fg)/0.14)]" />
      <WidgetCommentsSkeleton />
    </div>
  );
}

export function WidgetCommentThreadSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading comments">
      {range(rows).map((index) => (
        <div key={index} className="flex gap-3 py-4">
          <Bone className="size-7 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Bone className="h-3 w-24 rounded-full" />
              <Bone className="h-2.5 w-12 rounded-full" />
            </div>
            <Bone className="mt-2 h-3 w-full rounded-full" />
            <Bone className="mt-1.5 h-3 w-[68%] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WidgetCommentsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="px-5 py-5" aria-busy="true" aria-label="Loading comments">
      <Bone className="h-2.5 w-28 rounded-full" />
      <Bone className="mt-3 h-[6.5rem] w-full rounded-xl" />
      <div className="mt-2">
        <WidgetCommentThreadSkeleton rows={rows} />
      </div>
    </div>
  );
}

export function WidgetHeaderSkeleton() {
  return (
    <>
      <Bone className="size-8 shrink-0 rounded-md" />
      <Bone className="h-4 w-28 rounded-full" />
      <div className="min-w-0 flex-1" />
      <Bone className="h-8 w-[7.25rem] rounded-md" />
    </>
  );
}

export { Bone };
