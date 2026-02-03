
function setCookie(name: string, value: string, days?: number) {
  let expires = "";
  if (typeof days === "number" && days > 0) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name: string) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c && c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c && c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export async function getBrowserFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";

  const COOKIE_NAME = "anon_session_id";
  const existing = getCookie(COOKIE_NAME);
  if (existing) return existing;

  let id = "";
  try {
    id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : "";
  } catch {
    id = "";
  }
  if (!id) {
    const arr = new Uint8Array(16);
    try {
      crypto.getRandomValues(arr);
    } catch {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    id = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  setCookie(COOKIE_NAME, id);
  return id;
}
