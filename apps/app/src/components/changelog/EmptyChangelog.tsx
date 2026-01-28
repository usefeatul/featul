"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@featul/ui/components/button"
import { Plus } from "lucide-react"
import { EmptyFolderIcon } from "@featul/ui/icons/empty-folder"

interface EmptyChangelogProps {
    workspaceSlug?: string
}

export default function EmptyChangelog({ workspaceSlug }: EmptyChangelogProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] md:min-h-[70vh] py-10 px-4">
            <motion.div
                className="inline-flex flex-col items-center text-center px-6 py-10 max-w-md"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    className="relative flex items-center justify-center"
                    animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.03, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="flex items-center justify-center rounded-full size-20 sm:size-24">
                        <EmptyFolderIcon size={48} className="size-10 sm:size-12 text-muted-foreground" />
                    </div>
                </motion.div>

                <h1 className="mt-6 text-xl sm:text-2xl font-semibold tracking-tight max-w-sm">
                    No changelogs yet
                </h1>
                <p className="mt-2 text-accent text-sm sm:text-base max-w-xs">
                    Publish your first changelog to keep your users updated about new features and improvements.
                </p>

                {workspaceSlug && (
                    <div className="mt-6 w-full">
                        <Link href={`/workspaces/${workspaceSlug}/changelog/new`}>
                            <Button variant="quiet" className="w-full sm:w-auto px-5">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Entry
                            </Button>
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
