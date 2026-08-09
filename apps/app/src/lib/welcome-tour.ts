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
    window.sessionStorage.removeItem(PENDING_WELCOME_TOUR_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

const PENDING_WELCOME_TOUR_KEY = "featul:pending-welcome-tour";

export function markPendingWelcomeTour() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_WELCOME_TOUR_KEY, "1");
  } catch {
    /* ignore */
  }
}

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
