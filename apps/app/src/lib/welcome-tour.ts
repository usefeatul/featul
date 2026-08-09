const STORAGE_PREFIX = "featul:welcome-tour-completed:";

export function welcomeTourStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function hasCompletedWelcomeTour(userId: string | null | undefined) {
  if (!userId || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(welcomeTourStorageKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markWelcomeTourCompleted(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(welcomeTourStorageKey(userId), "1");
  } catch {
    /* ignore quota / private mode */
  }
}
