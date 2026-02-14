interface PostSubmitGuardInput {
  title: string
  hasSelectedBoard: boolean
  isPending: boolean
  uploadingImage: boolean
}

export function canSubmitPostForm({
  title,
  hasSelectedBoard,
  isPending,
  uploadingImage,
}: PostSubmitGuardInput): boolean {
  return title.trim().length > 0 && hasSelectedBoard && !isPending && !uploadingImage
}
