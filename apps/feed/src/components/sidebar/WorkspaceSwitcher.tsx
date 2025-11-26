"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@feedgot/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@feedgot/ui/components/dropdown-menu";
import { client } from "@feedgot/api/client"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSlugFromPath } from "../../config/nav";
import { ChevronIcon } from "@feedgot/ui/icons/chevron";
import { PlusIcon } from "@feedgot/ui/icons/plus";
import { useWorkspaceLogo } from "@/lib/branding-store";

type Ws = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  domain?: string | null;
};

export default function WorkspaceSwitcher({
  className = "",
  initialWorkspace,
  initialWorkspaces,
}: {
  className?: string;
  initialWorkspace?: Ws | null;
  initialWorkspaces?: Ws[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await client.workspace.listMine.$get();
      const data = await res.json();
      return (data?.workspaces || []) as Ws[];
    },
    initialData: initialWorkspaces || [],
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [currentDetails, setCurrentDetails] = React.useState<Ws | null>(initialWorkspace || null);
  const [open, setOpen] = React.useState(false);
  const slug = getSlugFromPath(pathname || "");
  const liveLogo = useWorkspaceLogo(slug || "");

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!slug) return;
        const detailRes = await client.workspace.bySlug.$get({ slug });
        if (!active) return;
        const detailData = await detailRes.json();
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
  const currentLogo: string | null =
    liveLogo ?? currentDetails?.logo ?? current?.logo ?? null;
  const currentName =
    currentDetails?.name ?? current?.name ?? (slug || "Current");
  const all = workspaces;

  const handleSelectWorkspace = React.useCallback(
    (targetSlug: string) => {
      setOpen(false);
      try {
        router.prefetch(`/workspaces/${targetSlug}`);
      } catch {}
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
        <DropdownMenuTrigger
          className="w-full cursor-pointer"
          onMouseEnter={() => {
            try {
              queryClient.prefetchQuery({
                queryKey: ["workspaces"],
                queryFn: async () => {
                  const res = await client.workspace.listMine.$get();
                  const data = await res.json();
                  return (data?.workspaces || []) as Ws[];
                },
                staleTime: 300_000,
                gcTime: 300_000,
              });
            } catch {}
          }}
        >
          <div className="group flex items-center gap-2 rounded-md px-2 py-2 text-md text-accent hover:bg-muted cursor-pointer">
            <div className={cn("relative w-6 h-6 rounded-md border ring-1 ring-border overflow-hidden", currentLogo ? "bg-transparent" : "bg-muted")}>
              {currentLogo ? (
                <img
                  src={currentLogo}
                  alt={currentName}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : null}
            </div>
            <span className="transition-colors">{currentName}</span>
            <ChevronIcon className="ml-auto size-3 text-foreground/80 transition-colors" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-40 max-w-[95vw] max-h-[80vh] overflow-auto p-2"
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
                      <div className="relative w-6 h-6 rounded-md bg-muted border ring-1 ring-border overflow-hidden">
                        <img
                          src={logoUrl}
                          alt={w.name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-muted border ring-1 ring-border" />
                    )}
                    <span className="truncate text-md">{w.name}</span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem
                onSelect={handleCreateNew}
                className="text-sm flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted"
              >
                <PlusIcon className="size-4" />
                Add workspace
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
