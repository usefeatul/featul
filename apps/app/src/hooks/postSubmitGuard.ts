interface PostSubmitGuardInput {
  title: string
  hasSelectedBoard: boolean
  isPending: boolean
  uploadingImage: boolean
}

export const POST_TITLE_MIN_LENGTH = 3

export function canSubmitPostForm({
  title,
  hasSelectedBoard,
  isPending,
  uploadingImage,
}: PostSubmitGuardInput): boolean {
  return title.trim().length > 0 && hasSelectedBoard && !isPending && !uploadingImage
}

export function getPostTitleMinError(title: string): string | null {
  if (title.trim().length < POST_TITLE_MIN_LENGTH) {
    return `Title must be at least ${POST_TITLE_MIN_LENGTH} characters`
  }
  return null
}
