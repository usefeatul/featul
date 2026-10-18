import CopyButton from "./copy";

export default function CodeBlock({
  code,
  label,
}: {
  code: string;
  label: string;
}) {
  const lines = code.split("\n");
  return (
    <div className="group/code relative overflow-hidden rounded-xl border border-border/50 bg-muted/30 dark:border-white/8 dark:bg-black/40">
      <div className="absolute right-2 top-2 z-10">
        <CopyButton text={code} label={`Copy ${label}`} iconOnly />
      </div>
      <pre
        tabIndex={0}
        aria-label={label}
        className="overflow-x-auto py-3 pr-14 font-mono text-xs leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <code className="grid grid-cols-[auto_1fr]">
          {lines.map((line, index) => (
            <span key={index} className="contents">
              <span
                aria-hidden
                className="select-none border-r border-border/40 px-3 text-right text-muted-foreground/60 tabular-nums"
              >
                {index + 1}
              </span>
              <span className="whitespace-pre pl-4 text-foreground/85">
                {line || " "}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
