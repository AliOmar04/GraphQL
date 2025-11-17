// auditRatio.js
export function renderAuditPie({
  totalUp,
  totalDown,
  size = 180,                  // overall size of the SVG box
  ringWidth = 16,              // thickness of the donut ring
  doneColor = "#00B2FF",       // cyan (Done)
  recvColor = "#FF5E00",       // orange (Received)
  bgRing = "rgba(255,255,255,0.06)", // faint background ring
} = {}) {
  const up = Number(totalUp) || 0;
  const down = Number(totalDown) || 0;
  const total = up + down;

  const w = size;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;
  const r = (size / 2) - ringWidth / 2;  // stroke radius
  const C = 2 * Math.PI * r;              // circumference

  // ratio text (Done / Received)
  let ratio;
  if (down === 0) ratio = up > 0 ? "∞" : "0.0";
  else ratio = (up / down).toFixed(1);

  // handle no data
  if (total === 0) {
    return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="No audit data">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${bgRing}" stroke-width="${ringWidth}"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
        font-family="Orbitron, system-ui, sans-serif" font-weight="900" font-size="${size * 0.22}"
        fill="#cfd6e3">0.0</text>
  <text x="${cx}" y="${cy + size * 0.16}" text-anchor="middle" dominant-baseline="middle"
        font-family="Rajdhani, system-ui, sans-serif" font-weight="700" font-size="${size * 0.10}"
        fill="#9aa3af">ratio</text>
</svg>`;
  }

  const doneP = up / total;
  const recvP = down / total;

  const doneLen = Math.max(0, Math.min(C, C * doneP));
  const recvLen = Math.max(0, Math.min(C, C * recvP));

  // final SVG
  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Audit ratio donut">
  <defs>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="gradDone" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${doneColor}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${doneColor}" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="gradRecv" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${recvColor}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${recvColor}" stop-opacity="0.7"/>
    </linearGradient>
  </defs>

  <!-- background ring -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${bgRing}" stroke-width="${ringWidth}"/>

  <!-- arcs: rotate so they start at top, draw Received first and Done after -->
  <g transform="rotate(-90 ${cx} ${cy})">
    <!-- Received (first) -->
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="url(#gradRecv)" stroke-width="${ringWidth}"
            stroke-linecap="butt" filter="url(#softGlow)"
            stroke-dasharray="${recvLen} ${C - recvLen}"
            stroke-dashoffset="${-doneLen}"/>
    <!-- Done (second, continues after Received) -->
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="url(#gradDone)" stroke-width="${ringWidth}"
            stroke-linecap="butt" filter="url(#softGlow)"
            stroke-dasharray="${doneLen} ${C - doneLen}"
            stroke-dashoffset="0"/>
  </g>

  <!-- ratio text -->
  <text x="${cx}" y="${cy - size * 0.02}" text-anchor="middle" dominant-baseline="middle"
        font-family="Orbitron, system-ui, sans-serif" font-weight="900" font-size="${size * 0.24}"
        fill="#e7e9ee">${ratio}</text>
  <text x="${cx}" y="${cy + size * 0.16}" text-anchor="middle" dominant-baseline="middle"
        font-family="Rajdhani, system-ui, sans-serif" font-weight="700" font-size="${size * 0.10}"
        fill="#e3dacfff">ratio</text>
</svg>`;
}
