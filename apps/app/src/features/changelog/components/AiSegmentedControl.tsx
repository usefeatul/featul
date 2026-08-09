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
      <div
        className="flex rounded-md border border-border bg-background p-0.5 dark:bg-black/30"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex-1 cursor-pointer rounded-sm px-2 py-2 text-center transition-colors",
                isActive
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
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
      </div>
    </div>
  );
}
