import { useState, useTransition, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { getBrowserFingerprint } from "@/utils/fingerprint";

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
  const queryClient = useQueryClient();
  const isVotingRef = useRef(false); // Track if we're currently voting

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

  // Sync with query data, but don't overwrite during optimistic updates
  useEffect(() => {
    if (statusData && !isVotingRef.current) {
      setHasVoted(statusData.hasVoted);
    }
  }, [statusData]);

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark that we're voting to prevent query sync from overwriting
    isVotingRef.current = true;

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

          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] });
            queryClient.invalidateQueries({ queryKey: ["member-activity"] });
            queryClient.invalidateQueries({ queryKey: ["post-vote-status", postId] });
          } catch {
            // Silently ignore query invalidation errors - these are non-critical
          }
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
      } finally {
        // Clear voting flag after operation completes
        isVotingRef.current = false;
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
