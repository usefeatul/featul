/** Client-side checks before creating or updating a post. */
interface PostSubmitGuardInput {
  title: string
  hasSelectedBoard: boolean
  isPending: boolean
  uploadingImage: boolean
}

/** Minimum trimmed title length accepted by the API. */
export const POST_TITLE_MIN_LENGTH = 3

/** True when title, board, and upload/pending flags allow submit. */
export function canSubmitPostForm({
  title,
  hasSelectedBoard,
  isPending,
  uploadingImage,
}: PostSubmitGuardInput): boolean {
  return title.trim().length > 0 && hasSelectedBoard && !isPending && !uploadingImage
}

/** Title-too-short message, or null if valid. */
export function getPostTitleMinError(title: string): string | null {
  if (title.trim().length < POST_TITLE_MIN_LENGTH) {
    return `Title must be at least ${POST_TITLE_MIN_LENGTH} characters`
  }
  return null
}
