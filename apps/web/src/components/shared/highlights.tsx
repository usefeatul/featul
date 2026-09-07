import { FreeIcon } from "@featul/ui/icons/free";
import { SetupIcon } from "@featul/ui/icons/setup";
import { UsersIcon } from "@featul/ui/icons/users";
import { cn } from "@featul/ui/lib/utils";

type HeroHighlightsProps = {
  centered?: boolean;
};

export function HeroHighlights({ centered = false }: HeroHighlightsProps) {
  return (
    <div
      className={cn(
        "mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-light text-accent sm:mt-3.5 sm:gap-6",
        centered && "justify-center",
      )}
      aria-label="Key highlights"
    >
      <span className="inline-flex items-center gap-2">
        <FreeIcon width={14} height={14} className="text-current" />
        Free forever
      </span>
      <span className="inline-flex items-center gap-2">
        <SetupIcon width={14} height={14} className="text-current" />
        30-second setup
      </span>
      <span className="inline-flex items-center gap-2">
        <UsersIcon width={14} height={14} className="text-current" />
        Unlimited users
      </span>
    </div>
  );
}
