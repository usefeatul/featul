import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { cn } from "@featul/ui/lib/utils";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import { YouTubeIcon } from "../../components/icons/youtube";

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  if (!url) {
    return null;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export const YouTubeComp = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateAndSubmit = useCallback(() => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }

    // Construct a clean YouTube URL
    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    onSubmit(cleanUrl);
  }, [url, onSubmit]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
      setError(null);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        validateAndSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
    [validateAndSubmit, onCancel]
  );

  const isValidUrl = extractYouTubeVideoId(url) !== null;

  return (
    <div className="flex flex-col gap-2 p-1 bg-muted rounded-2xl">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 mt-0.5 py-0.5">
        <div className="flex items-center gap-2 text-sm font-normal">
          <YouTubeIcon className="size-3.5" />
          Paste a YouTube URL
        </div>
      </div>

      <div className="bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
        <div className="flex flex-col gap-2">
          <Input
            autoFocus
            className={cn(
              "h-8 text-sm placeholder:text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <div className="flex items-center gap-2 mt-2 justify-end">
          <Button onClick={onCancel} size="sm" type="button" variant="card">
            Cancel
          </Button>
          <Button
            disabled={!url || !isValidUrl}
            onClick={validateAndSubmit}
            size="sm"
            type="button"
            variant="card"
          >
            Embed Video
          </Button>
        </div>
      </div>
    </div>
  );
};
