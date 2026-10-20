import { SegmentedControl } from "@featul/ui/components/segmented-control";

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
      <SegmentedControl
        aria-label={label}
        value={value}
        onValueChange={onChange}
        className="w-full"
        itemClassName="h-auto flex-1 flex-col gap-0 py-1.5"
        options={options.map((option) => ({
          value: option.value,
          title: option.hint,
          label: (
            <>
              <span className="block text-xs font-medium">{option.label}</span>
              {option.hint ? (
                <span className="mt-0.5 block text-[10px] font-normal leading-tight text-muted-foreground">
                  {option.hint}
                </span>
              ) : null}
            </>
          ),
        }))}
      />
    </div>
  );
}
