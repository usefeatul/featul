import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";

export function AiSegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string; hint?: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <Toolbar size="sm" role="radiogroup" aria-label={label}>
        {options.map((option, index) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                toolbarItemClass,
                "flex-1 cursor-pointer px-2 py-2 text-center",
                isActive ? "text-foreground" : "text-muted-foreground",
                index > 0 && "border-l border-border dark:border-white/10",
              )}
            >
              <span className="block text-xs font-medium">{option.label}</span>
              {option.hint ? (
                <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                  {option.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </Toolbar>
    </div>
  );
}
