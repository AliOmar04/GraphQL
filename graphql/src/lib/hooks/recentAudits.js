// lib/recentAudits.js
"use client";

import { useEffect, useState } from "react";
import { gql } from "../gql.js";

const projectFromPath = (path = "") => {
  const parts = path.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "—";
};

export async function fetchRecentAudits(userId, limit = 5) {
  const uid = Number(userId) || 0;
  const lim = Number(limit) || 5;

  const data = await gql(`
    {
      audit(
        where: {
          auditor: { id: { _eq: ${uid} } }
          private: { code: { _is_null: false } }
        }
        order_by: { id: desc }
        limit: ${lim}
      ) {
        id
        auditedAt
        group {
          path
          captain { login }
        }
      }
    }
  `);
  return data?.audit ?? [];
}

export function RecentAudits({ userId, limit = 5 }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchRecentAudits(userId, limit);
        if (alive) setRows(data);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [userId, limit]);

  if (loading) return <div className="muted">Loading…</div>;
  if (!rows || rows.length === 0) return <div className="muted">No recent audits.</div>;

  return (
    <ul className="list-grid">
      {rows.map((a) => {
        const login = a.group?.captain?.login || "—";
        const project = projectFromPath(a.group?.path);
        const done = !!a.auditedAt;

        return (
          <li key={a.id} className="list-card">
            <div className="list-row">
              <span className="list-login" title={login}>{login}</span>
              <span className="list-sep">–</span>
              <span className="list-project" title={project}>{project}</span>

              <span className={done ? "pill pill-ok" : "pill pill-warn"}>
                {done ? "Done!" : "Pending"}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
