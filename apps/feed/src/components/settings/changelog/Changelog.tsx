"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import { Switch } from "@feedgot/ui/components/switch";
import { Button } from "@feedgot/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@feedgot/ui/components/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@feedgot/ui/components/popover";
import { MoreVertical } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@feedgot/api/client";
import ModalTags from "./ModalTags";
import { toast } from "sonner";

export default function ChangelogSection({
  slug,
  initialIsVisible,
  initialPlan,
  initialTags,
}: {
  slug: string;
  initialIsVisible?: boolean;
  initialPlan?: string;
  initialTags?: any[];
}) {
  const queryClient = useQueryClient();
  const {
    data = { isVisible: Boolean(initialIsVisible) },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["changelog-settings", slug],
    queryFn: async () => {
      const res = await client.changelog.settings.$get({ slug });
      const d = await res.json();
      return { isVisible: Boolean((d as any)?.isVisible) };
    },
    initialData:
      initialIsVisible !== undefined
        ? { isVisible: Boolean(initialIsVisible) }
        : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const { data: tagsData = [], isLoading: tagsLoading, refetch: refetchTags } = useQuery({
    queryKey: ["changelog-tags", slug],
    queryFn: async () => {
      const res = await client.changelog.tagsList.$get({ slug });
      const d = await res.json();
      return (d as any)?.tags || [];
    },
    initialData: Array.isArray(initialTags) ? initialTags : undefined,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const visible = Boolean((data as any)?.isVisible);
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [tagModalOpen, setTagModalOpen] = React.useState(false);
  const [savingTag, setSavingTag] = React.useState(false);

  const handleToggleVisible = async (v: boolean) => {
    try {
      try {
        queryClient.setQueryData(["changelog-settings", slug], (prev: any) => ({
          ...(prev || {}),
          isVisible: v,
        }));
      } catch {}
      const res = await client.changelog.toggleVisibility.$post({
        slug,
        isVisible: v,
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(err?.message || "Update failed");
      }
      const msg = v
        ? "Changelog is now visible on your public site"
        : "Changelog is hidden from your public site";
      toast.success(msg);
      queryClient.setQueryData(["changelog-settings", slug], (prev: any) => ({
        ...(prev || {}),
        isVisible: v,
      }));
    } catch (e: unknown) {
      try {
        queryClient.setQueryData(["changelog-settings", slug], (prev: any) => ({
          ...(prev || {}),
          isVisible: !v,
        }));
      } catch {}
      const m =
        (e as { message?: string })?.message ||
        "Couldn't update changelog visibility";
      toast.error(m);
    }
  };

  return (
    <SectionCard
      title="Changelog"
      description="Manage product updates and visibility."
    >
      <div className="divide-y mt-2">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Visible on public site</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Switch
              checked={visible}
              onCheckedChange={handleToggleVisible}
              aria-label="Toggle Changelog Visibility"
            />
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-sm">Changelog Tags</div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Tag</TableHead>
                  <TableHead className="px-4 w-24 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tagsData || []).length === 0 && !tagsLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-4 py-6 text-accent">
                      No tags
                    </TableCell>
                  </TableRow>
                ) : (
                  (tagsData || []).map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="px-4 text-sm">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block size-3 rounded-full bg-primary"
                          />
                          <span>{t.name}</span>
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <Popover
                          open={menuOpenId === t.id}
                          onOpenChange={(v) =>
                            setMenuOpenId(v ? String(t.id) : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="More"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent list className="min-w-0 w-fit">
                            <PopoverList>
                              <PopoverListItem
                                role="menuitem"
                                onClick={async () => {
                                  try {
                                    setMenuOpenId(null);
                                    const res =
                                      await client.changelog.tagsDelete.$post({
                                        slug,
                                        tagId: String(t.id),
                                      });
                                    if (!res.ok) {
                                      const err = (await res
                                        .json()
                                        .catch(() => null)) as {
                                        message?: string;
                                      } | null;
                                      throw new Error(
                                        err?.message || "Delete failed"
                                      );
                                    }
                                    toast.success("Tag deleted");
                                    await refetchTags();
                                  } catch (e: unknown) {
                                    toast.error(
                                      (e as { message?: string })?.message ||
                                        "Failed to delete tag"
                                    );
                                  }
                                }}
                              >
                                <span className="text-sm text-red-500">
                                  Delete
                                </span>
                              </PopoverListItem>
                            </PopoverList>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <PlanNotice
            slug={slug}
            feature="changelog_tags"
            plan={initialPlan}
            changelogTagsCount={(tagsData || []).length}
          />
          <div>
            <Button
              type="button"
              variant="quiet"
              onClick={() => setTagModalOpen(true)}
            >
              Add tag
            </Button>
          </div>
          <ModalTags
            open={tagModalOpen}
            onOpenChange={setTagModalOpen}
            saving={savingTag}
            onSave={async (name) => {
              const n = String(name || "").trim();
              if (!n) return;
              try {
                setSavingTag(true);
                const res = await client.changelog.tagsCreate.$post({
                  slug,
                  name: n,
                });
                if (!res.ok) {
                  const err = (await res.json().catch(() => null)) as {
                    message?: string;
                  } | null;
                  throw new Error(err?.message || "Create failed");
                }
                toast.success("Tag created");
                setTagModalOpen(false);
                await refetchTags();
              } catch (e: unknown) {
                toast.error(
                  (e as { message?: string })?.message || "Failed to create tag"
                );
              } finally {
                setSavingTag(false);
              }
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
