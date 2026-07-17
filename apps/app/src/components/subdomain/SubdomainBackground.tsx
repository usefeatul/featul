export function SubdomainBackground() {
  return (
    <div className="fixed inset-0 -z-10 flex flex-col">
      <div className="bg-background border-b h-44 sm:h-56" />
      <div className="bg-card border-b flex-1" />
    </div>
  );
}
