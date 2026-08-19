import type { ClipboardEvent, DragEvent } from "react"
import { toast } from "sonner"

export function getImageFileFromDataTransfer(
  data: DataTransfer | null
): File | null {
  if (!data) {
    return null
  }

  const fromFiles = Array.from(data.files).find((file) =>
    file.type.startsWith("image/")
  )
  if (fromFiles) {
    return fromFiles
  }

  for (const item of Array.from(data.items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      return item.getAsFile()
    }
  }

  return null
}

export function createPostImageTransferHandlers({
  onImageFile,
  uploading,
  hasImage,
}: {
  onImageFile: (file: File) => void
  uploading: boolean
  hasImage: boolean
}) {
  const accept = (
    event: ClipboardEvent | DragEvent,
    data: DataTransfer | null
  ) => {
    const file = getImageFileFromDataTransfer(data)
    if (!file) {
      return
    }

    event.preventDefault()

    if (uploading) {
      return
    }

    if (hasImage) {
      toast.error("Remove the current image before adding another.")
      return
    }

    onImageFile(file)
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
