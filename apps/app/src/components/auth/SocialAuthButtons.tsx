import { Button } from "@featul/ui/components/button";
import { GoogleIcon } from "@featul/ui/icons/google";
import GitHubIcon from "@featul/ui/icons/github";

export function SocialAuthButtons({
  isLoading,
  onGoogle,
  onGithub,
  className,
}: {
  isLoading: boolean;
  onGoogle: () => void;
  onGithub: () => void;
  className?: string;
}) {
  const rootClassName = className
    ? `flex flex-col ${className}`
    : "flex flex-col";

  return (
    <div className={rootClassName}>
      <Button
        type="button"
        variant="nav"
        onClick={onGoogle}
        disabled={isLoading}
        className="w-full text-sm font-normal gap-2 sm:gap-3 border-border/40 hover:bg-accent/40"
      >
        <div className="flex items-center gap-2">
          <GoogleIcon className="size-4 sm:size-5" />
          <span>Continue with Google</span>
        </div>
      </Button>
      <Button
        type="button"
        variant="nav"
        onClick={onGithub}
        disabled={isLoading}
        className="w-full text-sm font-normal gap-2 sm:gap-3 border-border/40 hover:bg-accent/40"
      >
        <div className="flex items-center gap-2">
          <GitHubIcon className="size-4 sm:size-5" />
          <span>Continue with GitHub</span>
        </div>
      </Button>
    </div>
  );
}
