// Time & window helpers — ported verbatim from ai-abps.html
export function timeToMinutes(t) {
  if (!t || typeof t !== 'string') return NaN;
  const parts = t.trim().split(':');
  if (parts.length !== 2) return NaN;
  const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return NaN;
  return h * 60 + m;
}

export function minutesToTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function parseWindow(win) {
  if (!win) return { start: NaN, end: NaN };
  const sep = win.includes('–') ? '–' : win.includes('—') ? '—' : '-';
  const parts = win.split(sep);
  if (parts.length !== 2) return { start: NaN, end: NaN };
  return { start: timeToMinutes(parts[0].trim()), end: timeToMinutes(parts[1].trim()) };
}

export function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

export function getBlockTimeRange(block) {
  let s = block.startTime ? timeToMinutes(block.startTime) : parseWindow(block.window).start;
  let e = block.endTime ? timeToMinutes(block.endTime) : parseWindow(block.window).end;
  return { s, e };
}

export function buildWindow(startMin, endMin) {
  return `${minutesToTime(startMin)}–${minutesToTime(endMin)}`;
}

export function calcDurationText(s, e) {
  const dur = e - s;
  return dur > 0 ? `${dur} min` : '0 min';
}