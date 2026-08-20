"use client";

import { useCallback, useState } from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { ImageIcon } from "@featul/ui/icons/image";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { X } from "lucide-react";
import { toast } from "sonner";
import { IMAGE_UPLOAD_CONTENT_TYPES, CHANGELOG_IMAGE_UPLOAD_MAX_BYTES } from "@featul/api/upload/policy";
import { uploadFileToSignedUrl } from "@/lib/upload";

interface CoverImageUploaderProps {
    workspaceSlug: string;
    coverImage: string | null;
    onCoverImageChange: (url: string | null) => void;
    variant?: "image" | "button";
}

export function CoverImageUploader({
    workspaceSlug,
    coverImage,
    onCoverImageChange,
    variant = "button",
}: CoverImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = useCallback(async (file: File) => {
        if (!IMAGE_UPLOAD_CONTENT_TYPES.includes(file.type as (typeof IMAGE_UPLOAD_CONTENT_TYPES)[number])) {
            toast.error("Unsupported file type. Please use PNG, JPEG, WebP, or GIF.");
            return;
        }
        if (file.size > CHANGELOG_IMAGE_UPLOAD_MAX_BYTES) {
            toast.error("Image too large. Maximum size is 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            const res = await client.storage.getUploadUrl.$post({
                slug: workspaceSlug,
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
                folder: "changelog/covers",
            });
            const data = await res.json();

            if ("uploadUrl" in data && "publicUrl" in data) {
                await uploadFileToSignedUrl(data.uploadUrl, file);
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

    if (variant === "image" && coverImage) {
        return (
            <img
                src={coverImage}
                alt="Cover"
                className="h-auto w-full object-cover"
            />
        );
    }

    return (
        <div className="flex items-center gap-1">
            <label className="cursor-pointer">
                <input
                    type="file"
                    accept={IMAGE_UPLOAD_CONTENT_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                    }}
                />
                <Button
                    variant="card"
                    size="icon"
                    className="h-7 w-7 dark:border-white/10 dark:bg-black"
                    asChild
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <span><LoaderIcon className="size-4 animate-spin" /></span>
                    ) : (
                        <span><ImageIcon className="size-4 text-muted-foreground" /></span>
                    )}
                </Button>
            </label>
            {coverImage ? (
                <Button
                    type="button"
                    variant="card"
                    size="icon"
                    className="h-7 w-7 dark:border-white/10 dark:bg-black"
                    onClick={() => onCoverImageChange(null)}
                    aria-label="Remove cover image"
                >
                    <X className="size-3.5" />
                </Button>
            ) : null}
        </div>
    );
}
