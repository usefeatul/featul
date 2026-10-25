import { after } from "next/server";
import { sendStatusNotifications, type StatusNotification } from "./sync";

/**
 * Sends voter emails after the response is sent, so GitHub's 10-second webhook timeout and the
 * settings "Sync" request aren't held up by email delivery.
 */
export function sendAfterResponse(notifications: StatusNotification[]) {
  if (notifications.length === 0) return;
  try {
    after(() => sendStatusNotifications(notifications));
  } catch {
    // Outside a Next request (scripts, tests): send without blocking the caller.
    void sendStatusNotifications(notifications);
  }
}
