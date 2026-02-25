"use client";

import { useRouter } from "next/navigation";
import { Button } from "@featul/ui/components/button";
// import { Switch } from "@featul/ui/components/switch"; 
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ArrowLeft, Save, MoreHorizontal, FileText, CheckCircle } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverList,
    PopoverListItem,
    PopoverSeparator,
} from "@featul/ui/components/popover";

interface EditorHeaderProps {
    workspaceSlug: string;
    isDraft: boolean;
    onDraftChange: (isDraft: boolean) => void;
    onSave: () => void;
    isSaving: boolean;
}

export function EditorHeader({
    workspaceSlug,     
    isDraft,
    onDraftChange,
    onSave,
    isSaving,
}: EditorHeaderProps) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex items-center justify-end mt-7 pr-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="nav" size="icon-sm" className="gap-2">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" list className="min-w-0 w-fit">
                        <PopoverList>

                            <PopoverListItem
                                onClick={onSave}
                                disabled={isSaving}
                                className="gap-2 text-sm"
                            >
                                {isSaving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </PopoverListItem>

                            <PopoverListItem
                                onClick={() => onDraftChange(!isDraft)}
                                className="gap-2 text-sm"
                            >
                                {isDraft ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                {isDraft ? "Publish Entry" : "Revert to Draft"}
                            </PopoverListItem>

                            <PopoverSeparator />

                            <PopoverListItem
                                onClick={() => router.push(`/workspaces/${workspaceSlug}/changelog`)}
                                className="gap-2 text-sm text-muted-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Changelog
                            </PopoverListItem>
                        </PopoverList>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
