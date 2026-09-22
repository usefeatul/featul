import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
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
    <div className={cn(overlayDialogClass, "flex flex-col gap-2")}>
      <div className="flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
        {icon}
        {title}
      </div>

      <div className={cn(overlayInnerClass, "px-4 py-3")}>
        <div className="flex flex-col gap-3">
          <Input
            autoFocus={autoFocus}
            className={cn(
              "h-8 text-sm placeholder:text-accent dark:placeholder:text-accent",
              error && "border-destructive focus-visible:ring-destructive",
            )}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            value={url}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            onClick={onCancel}
            size="sm"
            type="button"
            variant="card"
          >
            Cancel
          </Button>
          <Button
            disabled={!url || !isValidUrl(url)}
            onClick={validateAndSubmit}
            size="sm"
            type="button"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
