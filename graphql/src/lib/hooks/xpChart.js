// xpChart.js — SVG line+dot chart (no libraries)
"use client";

import { gql } from "../gql.js";

/* ---------- Config ---------- */
const CFG = {
  xTicks: 6,
  yTicks: 6,
  dotR: 3.2,
  dotRHover: 5,
  topPaddingRatio: 0.08, // add headroom on Y
  lineColor: "#37e2ff",
  lineWidth: 2.5,
  dotFill: "#0ea5b7",
  dotStroke: "#9ae6ff",
  gridColor: "rgba(148,163,184,0.15)",
  axisColor: "#6b7280",
  textColor: "#cfd6e3",
};

async function fetchXPData() {
  const query = `
    query {
      transaction(
        where: {
          _and: [
            { type: { _eq: "xp" } }
            { path: { _like: "/bahrain/bh-module/%" } }
            { path: { _nlike: "/bahrain/bh-module/piscine-js/%" } }
          ]
        }
        order_by: { createdAt: asc }
      ) {
        id
        amount
        createdAt
        object { name }
      }
    }
  `;
  const data = await gql(query);
  return data?.transaction ?? [];
}

function makeLinearScale(d0, d1, r0, r1) {
  const d = d1 - d0 || 1;
  const R = r1 - r0;
  return v => r0 + ((v - d0) / d) * R;
}
const fmtK = n => {
  const a = Math.abs(n);
  if (a >= 1_000_000) return (n/1_000_000).toFixed(a % 1_000_000 ? 1 : 0) + "M";
  if (a >= 1_000)     return (n/1_000).toFixed(a % 1_000 ? 1 : 0) + "k";
  return String(n|0);
};
const fmtMonth = ms => new Date(ms).toLocaleDateString(undefined, { month: "short", year: "numeric" });

/**
 * Render the chart.
 * @param {string} containerId - div id to render into
 * @param {{cumulative?: boolean}} opts - cumulative=true for XP progress line; false for per-project amount
 */
export async function renderXPChart(containerId, opts = { cumulative: true }) {
  if (typeof document === "undefined") return;

  const container = document.getElementById(containerId);
  if (!container) return;

  container.style.position = "relative";
  container.innerHTML = "";

  // Tooltip
  const tip = document.createElement("div");
  Object.assign(tip.style, {
    position: "absolute",
    pointerEvents: "none",
    padding: "6px 8px",
    border: "1px solid #334155",
    background: "rgba(15,16,19,0.95)",
    color: "#e5e7eb",
    borderRadius: "8px",
    fontSize: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,.35)",
    opacity: "0",
    transition: "opacity 120ms ease",
    zIndex: "10",
  });
  container.appendChild(tip);

  // Loading
  const loading = document.createElement("p");
  loading.textContent = "Loading…";
  loading.style.color = CFG.textColor;
  container.appendChild(loading);

  let rows = [];
  try {
    rows = await fetchXPData();
  } finally {
    loading.remove();
  }
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.textContent = "No XP data available.";
    empty.style.color = CFG.textColor;
    container.appendChild(empty);
    return;
  }

  // Build points (compute cumulative total)
  let total = 0;
  const pts = rows.map(r => {
    const t = new Date(r.createdAt).getTime();
    const amt = Number(r.amount) || 0;
    total += amt;
    return {
      id: r.id,
      name: r.object?.name ?? "Unknown project",
      amount: amt,
      total,            // cumulative
      t,
      createdAt: r.createdAt,
    };
  });

  // Dimensions
  const width  = Math.max(320, container.clientWidth || 900);
  const height = Math.max(260, Math.min(540, Math.round(width * 0.52)));
  const m = { top: 24, right: 24, bottom: 40, left: 56 };
  const iw = width - m.left - m.right;
  const ih = height - m.top - m.bottom;

  // Domains
  const tMin = pts[0].t;
  const tMax = pts[pts.length - 1].t;
  const yVals = opts.cumulative ? pts.map(p => p.total) : pts.map(p => p.amount);
  const yMin = 0;
  const yMax = Math.max(...yVals) * (1 + CFG.topPaddingRatio);

  // Scales
  const x = makeLinearScale(tMin, tMax, 0, iw);
  const y = makeLinearScale(yMin, yMax, ih, 0);

  // SVG
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.display = "block";
  svg.style.maxWidth = "100%";
  container.appendChild(svg);

  const g = document.createElementNS(NS, "g");
  g.setAttribute("transform", `translate(${m.left},${m.top})`);
  svg.appendChild(g);

  // Axes + grid
  const xAxis = document.createElementNS(NS, "line");
  xAxis.setAttribute("x1", "0");
  xAxis.setAttribute("y1", String(ih));
  xAxis.setAttribute("x2", String(iw));
  xAxis.setAttribute("y2", String(ih));
  xAxis.setAttribute("stroke", CFG.axisColor);
  g.appendChild(xAxis);

  for (let i = 0; i <= CFG.xTicks; i++) {
    const tVal = tMin + ((tMax - tMin) * i) / CFG.xTicks;
    const px = x(tVal);

    const tick = document.createElementNS(NS, "line");
    tick.setAttribute("x1", String(px));
    tick.setAttribute("y1", String(ih));
    tick.setAttribute("x2", String(px));
    tick.setAttribute("y2", String(ih + 6));
    tick.setAttribute("stroke", CFG.axisColor);
    g.appendChild(tick);

    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", String(px));
    label.setAttribute("y", String(ih + 18));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", CFG.textColor);
    label.setAttribute("font-size", "10");
    label.textContent = fmtMonth(tVal);
    g.appendChild(label);
  }

  const yAxis = document.createElementNS(NS, "line");
  yAxis.setAttribute("x1", "0");
  yAxis.setAttribute("y1", "0");
  yAxis.setAttribute("x2", "0");
  yAxis.setAttribute("y2", String(ih));
  yAxis.setAttribute("stroke", CFG.axisColor);
  g.appendChild(yAxis);

  for (let i = 0; i <= CFG.yTicks; i++) {
    const yVal = yMin + ((yMax - yMin) * i) / CFG.yTicks;
    const py = y(yVal);

    const tick = document.createElementNS(NS, "line");
    tick.setAttribute("x1", "-6");
    tick.setAttribute("y1", String(py));
    tick.setAttribute("x2", "0");
    tick.setAttribute("y2", String(py));
    tick.setAttribute("stroke", CFG.axisColor);
    g.appendChild(tick);

    if (i > 0 && i < CFG.yTicks) {
      const grid = document.createElementNS(NS, "line");
      grid.setAttribute("x1", "0");
      grid.setAttribute("y1", String(py));
      grid.setAttribute("x2", String(iw));
      grid.setAttribute("y2", String(py));
      grid.setAttribute("stroke", CFG.gridColor);
      g.appendChild(grid);
    }

    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", "-8");
    label.setAttribute("y", String(py + 3));
    label.setAttribute("text-anchor", "end");
    label.setAttribute("fill", CFG.textColor);
    label.setAttribute("font-size", "10");
    label.textContent = fmtK(yVal);
    g.appendChild(label);
  }

  // Axis labels
  const xLab = document.createElementNS(NS, "text");
  xLab.setAttribute("x", String(iw / 2));
  xLab.setAttribute("y", String(ih + 34));
  xLab.setAttribute("text-anchor", "middle");
  xLab.setAttribute("fill", CFG.textColor);
  xLab.setAttribute("font-size", "12");
  xLab.textContent = "Date";
  g.appendChild(xLab);

  const yLab = document.createElementNS(NS, "text");
  yLab.setAttribute("transform", `translate(-44 ${ih / 2}) rotate(-90)`);
  yLab.setAttribute("text-anchor", "middle");
  yLab.setAttribute("fill", CFG.textColor);
  yLab.setAttribute("font-size", "12");
  yLab.textContent = opts.cumulative ? "Cumulative XP" : "XP Amount";
  g.appendChild(yLab);

  // ---- LINE PATH ----
  const path = document.createElementNS(NS, "path");
  const d = pts.map((p, i) => {
    const X = x(p.t);
    const Y = y(opts.cumulative ? p.total : p.amount);
    return (i ? "L" : "M") + X + " " + Y;
  }).join(" ");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", CFG.lineColor);
  path.setAttribute("stroke-width", String(CFG.lineWidth));
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("stroke-linecap", "round");
  g.appendChild(path);

  // ---- DOTS ----
  for (const p of pts) {
    const cx = x(p.t);
    const cy = y(opts.cumulative ? p.total : p.amount);

    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", String(cx));
    dot.setAttribute("cy", String(cy));
    dot.setAttribute("r", String(CFG.dotR));
    dot.setAttribute("fill", CFG.dotFill);
    dot.setAttribute("stroke", CFG.dotStroke);
    dot.setAttribute("stroke-width", "1");
    dot.style.cursor = "pointer";

    const title = document.createElementNS(NS, "title");
    title.textContent =
      `${p.name}\n` +
      (opts.cumulative
        ? `Total: ${p.total.toLocaleString()}`
        : `Amount: ${p.amount.toLocaleString()}`) +
      `\nDate: ${new Date(p.createdAt).toLocaleDateString()}`;
    dot.appendChild(title);

    dot.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      tip.innerHTML = `
        <div style="font-weight:700; margin-bottom:2px;">${p.name}</div>
        <div>${opts.cumulative ? "Total" : "Amount"}: ${(opts.cumulative ? p.total : p.amount).toLocaleString()}</div>
        <div>Date: ${new Date(p.createdAt).toLocaleDateString()}</div>
      `;
      tip.style.left = `${e.clientX - rect.left + 12}px`;
      tip.style.top  = `${e.clientY - rect.top + 12}px`;
      tip.style.opacity = "1";
      dot.setAttribute("r", String(CFG.dotRHover));
    });
    dot.addEventListener("mouseleave", () => {
      tip.style.opacity = "0";
      dot.setAttribute("r", String(CFG.dotR));
    });

    g.appendChild(dot);
  }
}
