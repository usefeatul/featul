/** Seed for entering bulk-select with a known id set. */
export interface InitialSelectionState {
  initialIsSelecting: boolean
  initialSelectedIds?: string[]
}

/** Partial restore of selection mode from persisted client state. */
export interface SelectionHydrationState {
  initialIsSelecting?: boolean
  initialSelectedIds?: string[]
}
