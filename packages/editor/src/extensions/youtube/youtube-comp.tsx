import { YoutubeIcon as YouTubeIcon } from "@featul/ui/icons/youtube";
import { EmbedInput } from "../shared/embed-input";
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
  return (
    <EmbedInput
      onSubmit={onSubmit}
      onCancel={onCancel}
      initialUrl={initialUrl}
      onUrlChange={onUrlChange}
      autoFocus={autoFocus}
      title="Paste a YouTube URL"
      placeholder="https://www.youtube.com/watch?v=..."
      submitLabel="Embed Video"
      invalidUrlMessage="Invalid YouTube URL"
      icon={<YouTubeIcon className="size-4" />}
      isValidUrl={isValidYouTubeUrl}
      normalizeUrl={normalizeYouTubeUrl}
    />
  );
};
