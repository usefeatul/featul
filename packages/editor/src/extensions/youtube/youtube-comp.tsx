import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { YoutubeIcon as YouTubeIcon } from "@featul/ui/icons/youtube";
import { cn } from "@featul/ui/lib/utils";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { isValidYouTubeUrl, normalizeYouTubeUrl } from "./youtube-utils";

export const YouTubeComp = ({
	onSubmit,
	onCancel,
	initialUrl = "",
	onUrlChange,
	autoFocus = true,
}: {
	onSubmit: (url: string) => void;
	onCancel: () => void;
	initialUrl?: string;
	onUrlChange?: (url: string) => void;
	autoFocus?: boolean;
}) => {
	const [url, setUrl] = useState(initialUrl);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setUrl(initialUrl);
	}, [initialUrl]);

	const validateAndSubmit = useCallback(() => {
		const normalizedUrl = normalizeYouTubeUrl(url);
		if (!normalizedUrl) {
			setError("Invalid YouTube URL");
			return;
		}

		onSubmit(normalizedUrl);
	}, [url, onSubmit]);

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const nextUrl = e.target.value;
			setUrl(nextUrl);
			onUrlChange?.(nextUrl);
			setError(null);
		},
		[onUrlChange],
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
		[validateAndSubmit, onCancel],
	);

	const isValidUrl = isValidYouTubeUrl(url);

	return (
		<div className="flex flex-col gap-3 p-3 bg-muted dark:bg-black/40 rounded-2xl">
			<div className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 mt-0.5 py-0.5">
				<div className="flex items-center gap-2 text-base font-normal">
					<YouTubeIcon className="size-4" />
					Paste a YouTube URL
				</div>
			</div>

			<div className="bg-card rounded-lg p-4 dark:bg-black/40 border border-border">
				<div className="flex flex-col gap-4">
					<Input
						autoFocus={autoFocus}
						className={cn(
							"h-11 text-base placeholder:text-accent dark:placeholder:text-accent",
							error && "border-destructive focus-visible:ring-destructive",
						)}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder="https://www.youtube.com/watch?v=..."
						value={url}
					/>
					{error && <p className="text-destructive text-xs">{error}</p>}
				</div>

				<div className="flex items-center gap-2 mt-4 justify-end">
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
						disabled={!url || !isValidUrl}
						onClick={validateAndSubmit}
						size="default"
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
