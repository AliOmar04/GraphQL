const KEY = "jwt";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}
export function setToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function parseJWT(raw) {
  if (!raw || typeof raw !== "string") return null;
  const token = raw.replace(/^"+|"+$/g, ""); // strip stray quotes
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { token, payload };
  } catch {
    return null;
  }
}

export function isJWTValid(raw) {
  const parsed = parseJWT(raw);
  if (!parsed) return false;
  const { payload } = parsed;
  if (typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return false;
  }
  return true;
}