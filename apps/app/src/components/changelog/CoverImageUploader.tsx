"use client";

import { useCallback, useState } from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { ImageIcon } from "@featul/ui/icons/image";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CoverImageUploaderProps {
    workspaceSlug: string;
    coverImage: string | null;
    onCoverImageChange: (url: string | null) => void;
}

export function CoverImageUploader({
    workspaceSlug,
    coverImage,
    onCoverImageChange,
}: CoverImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        try {
            const res = await client.storage.getUploadUrl.$post({
                slug: workspaceSlug,
                fileName: file.name,
                contentType: file.type,
                folder: "changelog/covers",
            });
            const data = await res.json();

            if ("uploadUrl" in data && "publicUrl" in data) {
                await fetch(data.uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type },
                });
                onCoverImageChange(data.publicUrl);
                toast.success("Cover image uploaded");
            }
        } catch (err) {
            toast.error("Failed to upload image");
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    }, [workspaceSlug, onCoverImageChange]);

    if (coverImage) {
        return (
            <div className="group mb-6 flex flex-col gap-2 p-1 rounded-2xl transition-colors hover:bg-muted -mx-3">
                <div className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 mt-0.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-sm font-normal">
                        <ImageIcon className="size-3.5" />
                        Cover Image
                    </div>
                </div>

                <div className="relative rounded-lg p-2 border border-transparent bg-transparent group-hover:bg-card group-hover:border-border dark:group-hover:bg-black/40 transition-all">
                    <div className="relative rounded-md overflow-hidden">
                        <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-auto max-h-80 object-cover"
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                            <div className="flex items-center gap-2 p-1.5 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-sm">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUpload(file);
                                        }}
                                    />
                                    <Button variant="card" size="sm" className="h-7 px-3 text-xs shadow-none" asChild>
                                        <span>Change</span>
                                    </Button>
                                </label>
                                <div className="w-px h-4 bg-border" />
                                <Button
                                    variant="card"
                                    size="icon"
                                    className="h-7 w-7 shadow-none"
                                    onClick={() => onCoverImageChange(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <label className="cursor-pointer">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                }}
            />
            <Button variant="card" size="icon" className="h-7 w-7" asChild disabled={isUploading}>
                {isUploading ? (
                    <span><Loader2 className="h-4 w-4 animate-spin" /></span>
                ) : (
                    <span><ImageIcon size={16} className="text-muted-foreground" /></span>
                )}
            </Button>
        </label>
    );
}
