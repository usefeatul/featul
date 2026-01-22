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
            <div className="relative group mb-6 rounded-lg overflow-hidden">
                <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-auto max-h-80 object-cover"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
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
                        <Button variant="secondary" size="sm" className="h-7 px-2 text-xs" asChild>
                            <span>Change</span>
                        </Button>
                    </label>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onCoverImageChange(null)}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
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
