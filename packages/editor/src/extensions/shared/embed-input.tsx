import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { cn } from "@featul/ui/lib/utils";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

type EmbedInputProps = {
  onSubmit: (url: string) => void;
  onCancel: () => void;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
  autoFocus?: boolean;
  title: string;
  placeholder: string;
  submitLabel: string;
  invalidUrlMessage: string;
  icon: ReactNode;
  isValidUrl: (url: string) => boolean;
  normalizeUrl: (url: string) => string | null;
};

export const EmbedInput = ({
  onSubmit,
  onCancel,
  initialUrl = "",
  onUrlChange,
  autoFocus = true,
  title,
  placeholder,
  submitLabel,
  invalidUrlMessage,
  icon,
  isValidUrl,
  normalizeUrl,
}: EmbedInputProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const validateAndSubmit = useCallback(() => {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      setError(invalidUrlMessage);
      return;
    }

    onSubmit(normalizedUrl);
  }, [invalidUrlMessage, normalizeUrl, onSubmit, url]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextUrl = event.target.value;
      setUrl(nextUrl);
      onUrlChange?.(nextUrl);
      setError(null);
    },
    [onUrlChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        validateAndSubmit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    },
    [onCancel, validateAndSubmit],
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted p-3 dark:bg-black/40">
      <div className="mt-0.5 flex flex-row items-center justify-between space-y-0 px-2 py-0.5 pb-0">
        <div className="flex items-center gap-2 text-base font-normal">
          {icon}
          {title}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 dark:bg-black/40">
        <div className="flex flex-col gap-4">
          <Input
            autoFocus={autoFocus}
            className={cn(
              "h-11 text-base placeholder:text-accent dark:placeholder:text-accent",
              error && "border-destructive focus-visible:ring-destructive",
            )}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            value={url}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            onClick={onCancel}
            size="default"
            type="button"
            variant="card"
          >
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/40 disabled:text-primary-foreground/70 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:disabled:bg-primary/40 dark:disabled:text-primary-foreground/70"
            disabled={!url || !isValidUrl(url)}
            onClick={validateAndSubmit}
            size="default"
            type="button"
            variant="card"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
