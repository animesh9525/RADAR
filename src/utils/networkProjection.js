// Geographic projection and geometry math for Network Operations SVG overlay
// Ported from ai-abps.html (lines 11144-11235)

export function r1(n) {
  return Math.round(n * 10) / 10;
}

export function noHexRgba(hex, a) {
  let c = String(hex || '#38bdf8').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  let n = parseInt(c, 16);
  if (isNaN(n)) n = 0x38bdf8;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function noCR(pts) {
  if (!pts || pts.length === 0) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return d;
}

export function netProject(networkDemo, sat) {
  const out = {};
  const wired = {};
  const stList = networkDemo.stations || [];
  const crList = networkDemo.corridors || [];
  const cosLat = Math.cos((sat.lat0 * Math.PI) / 180);
  const yPerDeg = 1200 / (sat.lonSpan * cosLat);

  for (let i = 0; i < stList.length; i++) {
    const s = stList[i];
    out[s.id] = [
      r1(600 + ((s.lng - sat.lng0) / sat.lonSpan) * 1200),
      r1(370 + (sat.lat0 - s.lat) * yPerDeg),
    ];
  }

  for (let i = 0; i < crList.length; i++) {
    const c = crList[i];
    if (c.coordinates && c.coordinates.length) {
      wired[c.id] = c.coordinates.map(p => [
        r1(600 + ((p[1] - sat.lng0) / sat.lonSpan) * 1200),
        r1(370 + (sat.lat0 - p[0]) * yPerDeg),
      ]);
    }
  }

  return { stations: out, wired };
}

export function noLeg(p1, p2) {
  if (!p1 || !p2) {
    return { p1: [0, 0], p2: [0, 0], len: 1, deg: 0, ux: 0, uy: 0 };
  }
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const ux = -dy / len;
  const uy = dx / len;
  return { p1, p2, len, deg, ux, uy };
}
