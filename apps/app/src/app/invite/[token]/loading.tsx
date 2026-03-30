import InviteSkeleton from "@/components/invite/InviteSkeleton";

export default function InviteRouteLoading() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="relative z-10 w-full max-w-md p-6">
        <InviteSkeleton />
      </div>
    </section>
  );
}
