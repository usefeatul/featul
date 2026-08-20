"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@featul/ui/components/button"
import { Plus } from "lucide-react"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

interface EmptyChangelogProps {
    workspaceSlug?: string
}

export default function EmptyChangelog({ workspaceSlug }: EmptyChangelogProps) {
    return (
        <div className={settingsCardShellClass}>
            <div className={settingsCardInnerClass}>
                <div className="flex flex-col items-center py-8 text-center">
                    <div className="text-sm font-medium text-foreground">No changelogs yet</div>
                    <p className="mt-1 max-w-sm text-sm text-accent">
                        Publish your first changelog to keep your users updated about new features and improvements.
                    </p>
                    {workspaceSlug ? (
                        <Button variant="quiet" asChild className="mt-4 px-5">
                            <Link href={`/workspaces/${workspaceSlug}/changelog/new`}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Entry
                            </Link>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
