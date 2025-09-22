import { SIGNIN_URL } from "./endpoints.js";
import { setToken, clearToken } from "./token.js";

export async function signIn(identifier, password) {
  const basic = typeof window !== "undefined"
    ? btoa(`${identifier}:${password}`)
    : Buffer.from(`${identifier}:${password}`).toString("base64");

  const res = await fetch(SIGNIN_URL, { method: "POST", headers: { Authorization: `Basic ${basic}` } });
  if (!res.ok) throw new Error("User does not exist or password incorrect");

  const text = await res.text();
  let token = text;
  try { token = JSON.parse(text)?.token || JSON.parse(text)?.jwt || text; } catch {}
  if (!token) throw new Error("JWT not returned");

  setToken(token);
  return token;
}

export function signOut() {
  clearToken();
}
