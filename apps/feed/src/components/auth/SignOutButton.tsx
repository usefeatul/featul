"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@oreilla/ui/lib/utils";
import { LogoutIcon } from "@oreilla/ui/icons/logout";
import { authClient } from "@oreilla/auth/client";
import { toast } from "sonner";

type Props = {
  className?: string;
  label?: string;
};

export default function SignOutButton({ className = "", label = "Sign out" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSignOut = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await authClient.signOut();
      toast.success("Signed out");
      router.replace("/auth/sign-in");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={loading}
      className={cn(
        "group flex items-center gap-2 rounded-md  px-3 py-2 text-xs md:text-sm text-accent hover:bg-muted",
        className
      )}
      aria-label="Sign out"
    >
      <LogoutIcon className="w-[18px] h-[18px] text-foreground/80 group-hover:text-primary transition-colors" />
      <span className="transition-colors">{label}</span>
    </button>
  );
}
