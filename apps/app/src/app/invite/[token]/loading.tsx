export default function InviteRouteLoading() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-10 w-4/5 rounded-md bg-muted" />
            <div className="h-4 w-full rounded-full bg-muted" />
            <div className="h-4 w-3/4 rounded-full bg-muted" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-md bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-32 rounded-full bg-muted" />
                <div className="h-3 w-24 rounded-full bg-muted" />
              </div>
              <div className="h-7 w-[4.5rem] rounded-md bg-muted" />
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="size-9 rounded-md bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-20 rounded-full bg-muted" />
                <div className="h-4 w-40 rounded-full bg-muted" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-11 rounded-md bg-muted" />
            <div className="h-11 rounded-md bg-muted/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
