import type { ClipboardEvent, DragEvent } from "react"
import { toast } from "sonner"

export function getImageFilesFromDataTransfer(
  data: DataTransfer | null
): File[] {
  if (!data) {
    return []
  }

  const fromFiles = Array.from(data.files).filter((file) =>
    file.type.startsWith("image/")
  )
  if (fromFiles.length > 0) {
    return fromFiles
  }

  const fromItems: File[] = []
  for (const item of Array.from(data.items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile()
      if (file) {
        fromItems.push(file)
      }
    }
  }
  return fromItems
}

export function createPostImageTransferHandlers({
  onImageFiles,
  uploading,
  imageCount,
  maxImages,
}: {
  onImageFiles: (files: File[]) => void
  uploading: boolean
  imageCount: number
  maxImages: number
}) {
  const accept = (
    event: ClipboardEvent | DragEvent,
    data: DataTransfer | null
  ) => {
    const files = getImageFilesFromDataTransfer(data)
    if (files.length === 0) {
      return
    }

    event.preventDefault()

    if (uploading) {
      return
    }

    if (imageCount >= maxImages) {
      toast.error(`You can add up to ${maxImages} images.`)
      return
    }

    onImageFiles(files)
  }

  return {
    onPaste: (event: ClipboardEvent<HTMLFormElement>) => {
      accept(event, event.clipboardData)
    },
    onDragOver: (event: DragEvent<HTMLFormElement>) => {
      if (event.dataTransfer?.types.includes("Files")) {
        event.preventDefault()
      }
    },
    onDrop: (event: DragEvent<HTMLFormElement>) => {
      accept(event, event.dataTransfer)
    },
  }
}
