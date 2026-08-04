import { FreeIcon } from "@featul/ui/icons/free";
import { SetupIcon } from "@featul/ui/icons/setup";
import { UsersIcon } from "@featul/ui/icons/users";

export function HeroHighlights() {
  return (
    <div
      className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-light text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.35)] sm:mt-8 sm:gap-6"
      aria-label="Key highlights"
    >
      <span className="inline-flex items-center gap-2">
        <FreeIcon width={14} height={14} className="text-white" />
        Free forever
      </span>
      <span className="inline-flex items-center gap-2">
        <SetupIcon width={14} height={14} className="text-white" />
        30-second setup
      </span>
      <span className="inline-flex items-center gap-2">
        <UsersIcon width={14} height={14} className="text-white" />
        Unlimited users
      </span>
    </div>
  );
}
