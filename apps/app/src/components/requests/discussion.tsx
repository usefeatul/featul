"use client";

import { useState, type ComponentProps } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@featul/ui/components/tabs";
import CommentList from "@/components/comments/CommentList";
import Activity from "./activity";
import { usePostActivity } from "@/hooks/usePostActivity";

type DiscussionProps = Omit<
  ComponentProps<typeof CommentList>,
  "renderDiscussion" | "hideHeading"
>;

export default function Discussion(props: DiscussionProps) {
  const activity = usePostActivity(props.postId, props.surface ?? "workspace");
  const activityCount = activity.data?.pages[0]?.totalCount;
  const [tab, setTab] = useState("comments");
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(String(value));
        if (value === "activity") void activity.refetch();
      }}
      className="min-w-0"
    >
      <CommentList
        {...props}
        hideHeading
        renderDiscussion={(thread, count) => (
          <div className="space-y-3">
            <TabsList aria-label="Post discussion">
              <TabsTrigger
                value="comments"
                className="data-[active]:text-foreground data-[active]:border-primary md:data-[active]:border-transparent"
              >
                Comments{" "}
                <span className="text-xs tabular-nums text-muted-foreground">
                  {count}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[active]:text-foreground data-[active]:border-primary md:data-[active]:border-transparent"
              >
                Activity{" "}
                <span className="text-xs tabular-nums text-muted-foreground">
                  {activityCount ?? (activity.isPending ? "…" : "—")}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="comments"
              keepMounted
              className="data-[hidden]:hidden"
            >
              {thread ??
                (props.allowComments !== false && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No comments yet. Start the conversation above.
                  </p>
                ))}
            </TabsContent>
            <TabsContent value="activity">
              <Activity activity={activity} />
            </TabsContent>
          </div>
        )}
      />
    </Tabs>
  );
}
