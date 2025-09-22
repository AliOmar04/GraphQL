import { GQL_URL } from "./endpoints.js";
import { getToken, clearToken, isJWTValid } from "./token.js";


function logUserOut() {
  if (typeof window !== "undefined") window.location.assign("/");
}

export async function gql(query, variables = {}) {
  const raw = getToken();

  if (!isJWTValid(raw)) {
    clearToken();
    logUserOut();
    throw new Error("unauthorized");
  }

  const token = (raw || "").replace(/^"+|"+$/g, "");


  const res = await fetch(GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401) {
    const text = await res.text().catch(() => "");
    clearToken();
    logUserOut();
    const err = new Error("unauthorized");
    err.code = 401;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[gql] HTTP error", res.status, text);
    throw new Error(`GraphQL error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    console.error("[gql] GraphQL errors:", json.errors);
    const err = new Error(json.errors.map(e => e.message).join("; "));
    err.code = 400;
    throw err;
  }
  return json.data;
}
