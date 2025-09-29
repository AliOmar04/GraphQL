// lib/recentProjects.js
"use client";

import { useEffect, useState } from "react";
import { gql } from "../gql.js";

export async function fetchRecentProjects(limit = 5) {
  const data = await gql(`
    {
      transaction(
        where: {
          type: { _eq: "xp" }
          _and: [
            { path: { _like: "/bahrain/bh-module%" } }
            { path: { _nlike: "/bahrain/bh-module/checkpoint%" } }
            { path: { _nlike: "/bahrain/bh-module/piscine-js%" } }
          ]
        }
        order_by: { createdAt: desc }
        limit: ${Number(limit) || 5}
      ) {
        createdAt
        object { name }
      }
    }
  `);
  return data?.transaction ?? [];
}

export function RecentProjects({ limit = 5 }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchRecentProjects(limit);
        if (alive) setRows(data);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [limit]);

  if (loading) return <div className="muted">Loading…</div>;
  if (!rows || rows.length === 0) return <div className="muted">No recent projects.</div>;

  return (
    <ul className="list-grid">
      {rows.map((t, i) => {
        const name = t.object?.name || "—";
        const date = t.createdAt
          ? new Date(t.createdAt).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" })
          : "—";
        return (
          <li key={`${name}-${t.createdAt || i}`} className="list-card">
            <div className="list-row">
              <span className="list-project" title={name}>{name}</span>
              <span className="pill pill-neutral" title={date}>{date}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
