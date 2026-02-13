export function SubdomainBackground() {
  return (
    <div className="fixed inset-0 -z-10 flex flex-col">
      <div className="bg-background dark:bg-background dark:border-background/60 border-b h-44 sm:h-56" />
      <div className="bg-card dark:bg-black/50 border-b flex-1" />
    </div>
  );
}
