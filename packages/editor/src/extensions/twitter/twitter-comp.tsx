import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { cn } from "@featul/ui/lib/utils";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import { TwitterIcon as Twitter } from "@featul/ui/icons/twitter";

// Validate Twitter/X.com URL
const TWITTER_REGEX =
  /^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/;

function isValidTwitterUrl(url: string): boolean {
  if (!url) {
    return false;
  }
  return TWITTER_REGEX.test(url);
}

export const TwitterComp = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateAndSubmit = useCallback(() => {
    if (!isValidTwitterUrl(url)) {
      setError("Invalid Tweet link");
      return;
    }

    onSubmit(url);
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

  const isValidUrl = isValidTwitterUrl(url) !== null;

  return (
    <div className="flex flex-col gap-2 p-1 bg-muted rounded-2xl">
      <div className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 mt-0.5 py-0.5">
        <div className="flex items-center gap-2 text-sm font-normal">
          <Twitter className="size-3.5" />
          Paste a Tweet link
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
            placeholder="https://x.com/username/status/..."
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
            Embed Tweet
          </Button>
        </div>
      </div>
    </div>
  );
};
