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
import type { InitialActivity } from "@/types/activity";

type DiscussionProps = Omit<
  ComponentProps<typeof CommentList>,
  "renderDiscussion" | "hideHeading"
> & { initialActivity?: InitialActivity };

/** Public portals show comments only; the activity timeline is for the workspace. */
export default function Discussion(props: DiscussionProps) {
  if (props.surface === "public") {
    const { initialActivity: _initialActivity, ...rest } = props;
    return <PublicDiscussion {...rest} />;
  }
  return <WorkspaceDiscussion {...props} />;
}

function PublicDiscussion(
  props: Omit<DiscussionProps, "initialActivity">,
) {
  return (
    <CommentList
      {...props}
      hideHeading
      renderDiscussion={(thread, count) => (
        <div className="space-y-3 pt-4">
          <h2 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            Comments
            <span className="text-xs tabular-nums text-muted-foreground">
              {count}
            </span>
          </h2>
          {thread ??
            (props.allowComments !== false && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No comments yet. Start the conversation above.
              </p>
            ))}
        </div>
      )}
    />
  );
}

function WorkspaceDiscussion({
  initialActivity,
  ...props
}: DiscussionProps) {
  const activity = usePostActivity(
    props.postId,
    props.surface ?? "workspace",
    initialActivity,
  );
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
                  {activityCount}
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
            <TabsContent
              value="activity"
              keepMounted
              className="data-[hidden]:hidden"
            >
              <Activity activity={activity} />
            </TabsContent>
          </div>
        )}
      />
    </Tabs>
  );
}
