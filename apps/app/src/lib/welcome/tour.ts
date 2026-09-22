const STORAGE_PREFIX = "featul:welcome-tour-completed:";

export function welcomeTourStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

/** True when this user finished the welcome tour (localStorage). */
export function hasCompletedWelcomeTour(userId: string | null | undefined) {
  if (!userId || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(welcomeTourStorageKey(userId)) === "1";
  } catch {
    return false;
  }
}

/** Marks the tour done and clears the session pending flag. */
export function markWelcomeTourCompleted(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(welcomeTourStorageKey(userId), "1");
    window.sessionStorage.removeItem(PENDING_WELCOME_TOUR_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

const PENDING_WELCOME_TOUR_KEY = "featul:pending-welcome-tour";

/** Session-only flag so the tour can resume after a reload. */
export function markPendingWelcomeTour() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_WELCOME_TOUR_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Whether a welcome tour is queued in this tab. */
export function hasPendingWelcomeTour() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(PENDING_WELCOME_TOUR_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearPendingWelcomeTour() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_WELCOME_TOUR_KEY);
  } catch {
    /* ignore */
  }
}
