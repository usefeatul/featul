import { Button } from "@featul/ui/components/button";
import { GoogleIcon } from "@featul/ui/icons/google";
import GitHubIcon from "@featul/ui/icons/github";
import { LastUsedTag } from "./LastUsedTag";

export function SocialAuthButtons({
  isLoading,
  onGoogle,
  onGithub,
  className,
  lastUsedMethod,
}: {
  isLoading: boolean;
  onGoogle: () => void;
  onGithub: () => void;
  className?: string;
  lastUsedMethod?: string | null;
}) {
  const rootClassName = className
    ? `flex flex-col ${className}`
    : "flex flex-col";
  const googleIsLastUsed = lastUsedMethod === "google";
  const githubIsLastUsed = lastUsedMethod === "github";

  return (
    <div className={rootClassName}>
      <Button
        type="button"
        variant="nav"
        onClick={onGoogle}
        disabled={isLoading}
        className="relative overflow-visible w-full text-sm font-normal gap-2 sm:gap-3 border-border/40 hover:bg-background"
      >
        <div className="flex w-full items-center justify-center gap-2">
          <GoogleIcon className="size-4 sm:size-5" />
          <span>Continue with Google</span>
        </div>
        {googleIsLastUsed ? <LastUsedTag /> : null}
      </Button>
      <Button
        type="button"
        variant="nav"
        onClick={onGithub}
        disabled={isLoading}
        className="relative overflow-visible w-full text-sm font-normal gap-2 sm:gap-3 border-border/40 hover:bg-background"
      >
        <div className="flex w-full items-center justify-center gap-2">
          <GitHubIcon className="size-4 sm:size-5" />
          <span>Continue with GitHub</span>
        </div>
        {githubIsLastUsed ? <LastUsedTag /> : null}
      </Button>
    </div>
  );
}
