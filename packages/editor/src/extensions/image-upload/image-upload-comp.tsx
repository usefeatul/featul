import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { ScrollArea } from "@featul/ui/components/scroll-area";
import { cn } from "@featul/ui/lib/utils";
import {
  CheckIcon,
  ImageIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { MediaItem } from "../../types";
import { useDropZone, useFileUpload, useUploader } from "./hooks";

// Simple URL validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export type ImageUploadCompProps = {
  initialFile?: File;
  onUpload: (url: string) => void;
  onCancel: () => void;
  upload: (file: File) => Promise<string>;
  media?: MediaItem[];
  fetchMedia?: () => Promise<MediaItem[]>;
  onError?: (error: Error) => void;
};

export const ImageUploadComp = ({
  initialFile,
  onUpload,
  onCancel,
  upload,
  media: providedMedia,
  fetchMedia,
  onError,
}: ImageUploadCompProps) => {
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[] | undefined>(providedMedia);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const { loading, uploadImage } = useUploader({ onUpload, upload, onError });
  const { handleUploadClick, ref } = useFileUpload();
  const { draggedInside, onDrop, onDragEnter, onDragLeave, onDragOver } =
    useDropZone({
      uploader: uploadImage,
    });

  // Fetch media if fetchMedia function is provided
  useEffect(() => {
    if (fetchMedia && !providedMedia) {
      setIsLoadingMedia(true);
      fetchMedia()
        .then((fetchedMedia) => {
          setMedia(fetchedMedia);
        })
        .catch(() => {
          setMedia([]);
        })
        .finally(() => {
          setIsLoadingMedia(false);
        });
    }
  }, [fetchMedia, providedMedia]);

  // Update media when providedMedia changes
  useEffect(() => {
    if (providedMedia) {
      setMedia(providedMedia);
    }
  }, [providedMedia]);

  // Auto-upload if initialFile is provided
  useEffect(() => {
    if (initialFile) {
      uploadImage(initialFile);
    }
  }, [initialFile, uploadImage]);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      onDrop(e);
    },
    [onDrop]
  );

  const handleEmbedUrl = useCallback(
    async (url: string) => {
      if (!url) {
        return;
      }

      setIsValidatingUrl(true);
      setUrlError(null);

      if (!isValidUrl(url)) {
        setUrlError("Please enter a valid URL");
        setIsValidatingUrl(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        onUpload(url);
        setEmbedUrl("");
        setShowEmbedInput(false);
        setIsValidatingUrl(false);
      };
      img.onerror = () => {
        setUrlError("Invalid image URL");
        setIsValidatingUrl(false);
      };
      img.src = url;
    },
    [onUpload]
  );


  const handleDropzoneClick = useCallback(() => {
    handleUploadClick();
  }, [handleUploadClick]);

  const handleDropzoneKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleUploadClick();
      }
    },
    [handleUploadClick]
  );

  // Get dropzone text based on drag state
  const getDropzoneText = () => {
    if (draggedInside) {
      return "Drop image here";
    }
    return "Drag and drop or click to upload";
  };

  return (
    <>

      <div className="flex flex-col gap-2 p-1 bg-muted rounded-2xl">
        <div className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 mt-0.5 py-0.5">
          <div className="flex items-center gap-2 text-sm font-normal">
            <ImageIcon className="size-3.5" />
            Upload or embed an image
          </div>
        </div>

        <div className="bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
          {/* Dropzone or Uploading state */}
          {loading ? (
            <div className="flex min-h-[80px] flex-1 flex-col items-center justify-center">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground text-sm mt-2">Uploading...</p>
            </div>
          ) : (
            // biome-ignore lint/a11y/useSemanticElements: Dropzone requires div for drag-and-drop functionality
            <div
              aria-label="Upload image by clicking or dragging and dropping"
              className={cn(
                "flex min-h-[80px] flex-1 cursor-pointer flex-col items-center justify-center rounded-md transition-colors",
                draggedInside
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
              onClick={handleDropzoneClick}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={handleDrop}
              onKeyDown={handleDropzoneKeyDown}
              role="button"
              tabIndex={0}
            >
              <p
                className={cn(
                  "text-center text-sm",
                  draggedInside ? "text-primary" : "text-accent",
                )}
              >
                {getDropzoneText()}
              </p>
              <input
                accept="image/*"
                aria-label="Upload image"
                className="sr-only size-0 overflow-hidden opacity-0"
                onChange={onFileChange}
                ref={ref}
                type="file"
              />
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-0 pt-0 gap-4">
            {showEmbedInput ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  className={cn(
                    "flex-1 h-8 text-sm placeholder:text-muted-foreground",
                    urlError && "border-destructive",
                  )}
                  disabled={isValidatingUrl || loading}
                  onChange={({ target }) => {
                    setEmbedUrl(target.value);
                    setUrlError(null);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      embedUrl &&
                      !isValidatingUrl &&
                      !loading
                    ) {
                      handleEmbedUrl(embedUrl);
                    }
                  }}
                  placeholder="Paste image URL"
                  value={embedUrl}
                />
                <Button
                  className="shrink-0"
                  disabled={!embedUrl || isValidatingUrl || loading}
                  onClick={() => handleEmbedUrl(embedUrl)}
                  size="sm"
                  type="button"
                  variant="card"
                >
                  {isValidatingUrl ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <CheckIcon className="size-4" />
                  )}
                </Button>
                <Button
                  className="shrink-0"
                  disabled={loading}
                  onClick={() => {
                    setShowEmbedInput(false);
                    setEmbedUrl("");
                    setUrlError(null);
                  }}
                  size="sm"
                  type="button"
                  variant="card"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {(media !== undefined || fetchMedia) && (
                  <Button
                    className="shrink-0"
                    disabled={loading}
                    onClick={() => setIsGalleryOpen(true)}
                    size="sm"
                    type="button"
                    variant="card"
                  >
                    Gallery
                  </Button>
                )}
                <Button
                  className="shrink-0"
                  disabled={loading}
                  onClick={() => setShowEmbedInput(true)}
                  size="sm"
                  type="button"
                  variant="card"
                >
                  Embed URL
                </Button>
              </div>
            )}
            <Button
              className="shrink-0"
              disabled={loading}
              onClick={onCancel}
              size="sm"
              type="button"
              variant="card"
            >
              Cancel
            </Button>
          </div>
          {urlError && <p className="text-destructive text-xs mt-2">{urlError}</p>}
        </div>
      </div >
    </>
  );
};
