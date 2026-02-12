import type { InitialSelectionState } from "@/types/selection"
import {
  parseSelectedIdsValue,
  parseSelectingValue,
  selectedCookieName,
  selectingCookieName,
} from "@/lib/selection-keys"

type CookieReader = {
  get(name: string): { value: string } | undefined
}

export function readInitialSelectionState(cookieStore: CookieReader, key: string): InitialSelectionState {
  return {
    initialIsSelecting: parseSelectingValue(cookieStore.get(selectingCookieName(key))?.value),
    initialSelectedIds: parseSelectedIdsValue(cookieStore.get(selectedCookieName(key))?.value),
  }
}
