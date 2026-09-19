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
import { cn } from "@featul/ui/lib/utils";

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
    const [isDragging, setIsDragging] = useState(false);

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

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleUpload(file);
        event.target.value = "";
    };

    return (
        <div
            className={cn(
                "group relative aspect-[2/1] max-h-96 min-h-48 w-full overflow-hidden rounded-2xl bg-black/[0.025] ring-1 ring-inset ring-black/[0.06] transition-colors dark:bg-white/[0.025] dark:ring-white/[0.06]",
                isDragging && "bg-black/[0.055] dark:bg-white/[0.055]",
                isUploading && "pointer-events-none opacity-70",
            )}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) handleUpload(file);
            }}
        >
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center">
                <input
                    type="file"
                    accept={IMAGE_UPLOAD_CONTENT_TYPES.join(",")}
                    className="hidden"
                    onChange={onFileChange}
                    disabled={isUploading}
                />
                {coverImage ? (
                    <>
                        <img
                            src={coverImage}
                            alt="Changelog cover"
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                        <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                        <span className="absolute bottom-3 right-3 inline-flex h-8 translate-y-1 items-center gap-1.5 rounded-md bg-black/65 px-2.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover:translate-y-0 group-hover:opacity-100">
                            <ImageIcon className="size-3.5" />
                            Change cover
                        </span>
                    </>
                ) : (
                    <span className="flex flex-col items-center gap-2 px-6 text-center">
                        {isUploading ? (
                            <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
                        ) : (
                            <span className="flex size-9 items-center justify-center rounded-lg bg-black/5 text-muted-foreground dark:bg-white/[0.06]">
                                <ImageIcon className="size-4" />
                            </span>
                        )}
                        <span className="text-sm font-medium text-foreground">
                            {isUploading ? "Uploading cover…" : "Add a cover image"}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                            Drop an image here or click to browse
                        </span>
                    </span>
                )}
            </label>
            {coverImage ? (
                <Button
                    type="button"
                    variant="plain"
                    size="icon-sm"
                    className="absolute right-3 top-3 size-8 rounded-md border-0 bg-black/65 p-0 text-white opacity-0 shadow-none ring-0 before:hidden backdrop-blur-sm hover:bg-black/80 hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => onCoverImageChange(null)}
                    aria-label="Remove cover image"
                    title="Remove cover image"
                >
                    <X className="size-3.5" />
                </Button>
            ) : null}
        </div>
    );
}
