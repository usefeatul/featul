"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@feedgot/ui/components/dropdown-menu";
import { client } from "@feedgot/api/client";
import { getSlugFromPath } from "../../config/nav";
import { DropdownIcon } from "@feedgot/ui/icons/dropdown";
import { Check } from "lucide-react";

type Ws = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  domain?: string | null;
};

export default function WorkspaceSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [workspaces, setWorkspaces] = React.useState<Ws[]>([]);
  const [currentDetails, setCurrentDetails] = React.useState<Ws | null>(null);
  const [open, setOpen] = React.useState(false);
  const slug = getSlugFromPath(pathname || "");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [listRes, detailRes] = await Promise.all([
          client.workspace.listMine.$get(),
          slug ? client.workspace.bySlug.$get({ slug }) : Promise.resolve(null),
        ]);
        if (!active) return;
        const listData = await listRes.json();
        const detailData = detailRes ? await detailRes.json() : null;
        setWorkspaces(listData?.workspaces || []);
        setCurrentDetails(detailData?.workspace || null);
      } catch {
        if (!active) return;
        setCurrentDetails(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const current = React.useMemo(() => {
    return workspaces.find((w) => w.slug === slug) || null;
  }, [workspaces, slug]);
  const currentLogo: string | null = currentDetails?.logo ?? current?.logo ?? null;
  const currentName = currentDetails?.name ?? current?.name ?? (slug || "Current");
  const all = workspaces;

  const handleSelectWorkspace = React.useCallback(
    (targetSlug: string) => {
      setOpen(false);
      router.push(`/workspaces/${targetSlug}`);
    },
    [router]
  );
  const handleCreateNew = React.useCallback(() => {
    setOpen(false);
    router.push("/workspaces/new");
  }, [router]);

  return (
    <div className={cn(className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full cursor-pointer">
          <div className="group flex items-center gap-2 rounded-md px-2 py-2 text-sm text-accent hover:bg-muted cursor-pointer">
            {currentLogo ? (
              <div className="relative w-6 h-6 rounded-sm bg-muted border ring-1 ring-border/40 shadow-sm overflow-hidden">
                <img
                  src={currentLogo}
                  alt={currentName}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-sm bg-muted border ring-1 ring-border/40" />
            )}
            <span className="transition-colors">{currentName}</span>
            <DropdownIcon className="ml-auto size-3 text-foreground/80 transition-colors" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 max-w-[95vw] max-h-[80vh] overflow-auto p-2"
          side="bottom"
          align="center"
          sideOffset={8}
        >
          {all.length === 0 ? (
            <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
          ) : (
            <div className="flex flex-col gap-1">
              {all.map((w) => {
                const logoUrl: string | null = w.logo ?? null;
                const isCurrent = w.slug === slug;
                return (
                  <DropdownMenuItem
                    key={w.slug}
                    onSelect={() => handleSelectWorkspace(w.slug)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded-md",
                      isCurrent ? "bg-muted" : "hover:bg-muted"
                    )}
                  >
                    {logoUrl ? (
                      <div className="relative w-6 h-6 rounded-sm bg-muted border ring-1 ring-border/40 shadow-sm overflow-hidden">
                        <img
                          src={logoUrl}
                          alt={w.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-sm bg-muted border ring-1 ring-border/40" />
                    )}
                    <span className="truncate text-sm">{w.name}</span>
                    {isCurrent ? (
                      <Check className="ml-auto size-4 text-primary" />
                    ) : (
                      <span className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem
                onSelect={handleCreateNew}
                className="p-0"
              >
                <div className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm text-center hover:bg-primary/90">
                  Create new project
                </div>
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
