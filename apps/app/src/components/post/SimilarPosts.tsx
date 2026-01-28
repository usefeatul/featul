import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UpvoteButton } from "@/components/upvote/UpvoteButton";
import { CommentsIcon } from "@featul/ui/icons/comments";
import type { SimilarPost } from "@/types/post";

interface SimilarPostsProps {
  posts: SimilarPost[];
}

export function SimilarPosts({ posts }: SimilarPostsProps) {
  return (
    <AnimatePresence>
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className=" overflow-hidden"
        >
          <div className="px-4 py-2 flex items-center justify-between border-t border-border/50 dark:border-border/50">
            <div className="text-xs font-extralight text-accent uppercase tracking-wide">
              Similar Posts
            </div>
          </div>

          <div className="divide-y divide-border">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                className="relative group p-4 hover:bg-muted/30 dark:hover:bg-black/30 transition-colors"
              >
                <Link
                  href={`/board/p/${post.slug}`}
                  className="absolute inset-0 focus:outline-none"
                >
                  <span className="sr-only">View post</span>
                </Link>

                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-light text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {post.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-accent shrink-0">
                    <div className="inline-flex items-center gap-2 relative z-10 pointer-events-none opacity-80">
                      <UpvoteButton
                        postId={post.id}
                        upvotes={post.upvotes || 0}
                        hasVoted={false}
                        className="text-xs"
                      />
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <CommentsIcon aria-hidden className="size-3.5" />
                      <span className="tabular-nums">
                        {post.commentCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
