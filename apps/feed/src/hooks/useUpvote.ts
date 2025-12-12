import { useState, useTransition, useEffect } from "react";
import { client } from "@oreilla/api/client";
import { toast } from "sonner";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import { useQuery } from "@tanstack/react-query";

interface UseUpvoteProps {
  postId: string;
  initialUpvotes: number;
  initialHasVoted?: boolean;
  onChange?: (v: { upvotes: number; hasVoted: boolean }) => void;
}

interface UseUpvoteReturn {
  upvotes: number;
  hasVoted: boolean;
  isPending: boolean;
  handleVote: (e: React.MouseEvent) => void;
}

export function useUpvote({
  postId,
  initialUpvotes,
  initialHasVoted = false,
  onChange,
}: UseUpvoteProps): UseUpvoteReturn {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isPending, startTransition] = useTransition();
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    getBrowserFingerprint().then(setFingerprint);
  }, []);

  const { data: statusData } = useQuery({
    queryKey: ["post-vote-status", postId, fingerprint],
    enabled: !!fingerprint,
    queryFn: async () => {
      const res = await client.post.getVoteStatus.$get({
        postId,
        fingerprint: fingerprint!,
      });
      if (!res.ok) return null;
      return await res.json();
    },
    staleTime: 10_000,
  });

  useEffect(() => {
    if (statusData) {
      setHasVoted(statusData.hasVoted);
    }
  }, [statusData]);

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const previousUpvotes = upvotes;
    const previousHasVoted = hasVoted;
    const nextHasVoted = !hasVoted;
    const nextUpvotes = nextHasVoted ? upvotes + 1 : upvotes - 1;

    setHasVoted(nextHasVoted);
    setUpvotes(nextUpvotes);

    if (onChange) onChange({ upvotes: nextUpvotes, hasVoted: nextHasVoted });

    startTransition(async () => {
      try {
        const res = await client.post.vote.$post({
          postId,
          fingerprint: fingerprint || undefined,
        });

        if (res.ok) {
          const data = await res.json();
          setUpvotes(data.upvotes);
          setHasVoted(data.hasVoted);
          if (onChange)
            onChange({ upvotes: data.upvotes, hasVoted: data.hasVoted });
        } else {
          // Revert optimistic update
          setUpvotes(previousUpvotes);
          setHasVoted(previousHasVoted);
          if (onChange)
            onChange({
              upvotes: previousUpvotes,
              hasVoted: previousHasVoted,
            });
          if (res.status === 401) toast.error("Please sign in to vote");
        }
      } catch (error) {
        // Revert optimistic update on error
        setUpvotes(previousUpvotes);
        setHasVoted(previousHasVoted);
        if (onChange)
          onChange({ upvotes: previousUpvotes, hasVoted: previousHasVoted });
        console.error("Failed to vote:", error);
      }
    });
  };

  return {
    upvotes,
    hasVoted,
    isPending,
    handleVote,
  };
}
