export function SubdomainBackground() {
  return (
    <div className="fixed inset-0 -z-10 flex flex-col">
      <div className="h-44 border-b border-border/70 bg-muted/60 dark:border-white/[0.06] dark:bg-background sm:h-56" />
      <div className="flex-1 border-b border-border/50 bg-card dark:border-white/[0.05] dark:bg-black/40" />
    </div>
  );
}
