import { TwitterIcon as Twitter } from "@featul/ui/icons/twitter";
import { EmbedInput } from "../shared/embed-input";
import { isValidTwitterUrl, normalizeTwitterUrl } from "./twitter-utils";

export const TwitterComp = ({
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
      title="Paste a Tweet link"
      placeholder="https://x.com/username/status/..."
      submitLabel="Embed Tweet"
      invalidUrlMessage="Invalid Tweet link"
      icon={<Twitter className="size-3.5" />}
      isValidUrl={isValidTwitterUrl}
      normalizeUrl={normalizeTwitterUrl}
    />
  );
};
