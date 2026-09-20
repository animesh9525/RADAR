import { buildWindow, calcDurationText, parseWindow, timeToMinutes } from './time';

const STATUS_ORDER = ['Clear', 'Warning', 'Conflict', 'Requires Review'];

// Ported verbatim from ai-abps.html — returns a normalized block guaranteed to
// have the full structure required by the UI and logic layers.
export function normalizeBlock(raw) {
  const win = raw.window || buildWindow(timeToMinutes(raw.startTime || '10:00'), timeToMinutes(raw.endTime || '12:00'));
  const parsed = parseWindow(win);
  return {
    id: raw.id,
    corridor: raw.corridor || 'C1',
    date: raw.date || 'Monday',
    window: win,
    startTime: raw.startTime || minutesToTimeSafe(parsed.start),
    endTime: raw.endTime || minutesToTimeSafe(parsed.end),
    duration: raw.duration || calcDurationText(parsed.start, parsed.end),
    utilization: raw.utilization || '75%',
    type: raw.type || 'SINGLE',
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    reason: raw.reason || '',
    from: raw.from || `Station ${raw.corridor || 'C1'}-A`,
    to: raw.to || `Station ${raw.corridor || 'C1'}-C`,
    track: raw.track || 'UP',
    priority: raw.priority || 'MEDIUM',
    maintenanceType: raw.maintenanceType || raw.type || 'SINGLE',
    requiredCrew: raw.requiredCrew != null ? raw.requiredCrew : (raw.tasks?.length ? raw.tasks.length * 2 + 2 : 4),
    availableCrew: raw.availableCrew != null ? raw.availableCrew : 6,
    requiredEquip: raw.requiredEquip || 'General',
    equipmentStatus: raw.equipmentStatus || 'AVAILABLE',
    status: raw.status || 'Clear',
    lastEdited: raw.lastEdited || null,
    assets: raw.assets,
  };
}

function minutesToTimeSafe(min) {
  const base = Math.floor(min / 60), rest = min % 60;
  const h = String(base).padStart(2, '0'), m = String(rest).padStart(2, '0');
  return `${h}:${m}`;
}

export function getBlockStatusBadge(status) {
  const map = {
    Clear: { text: '🟢 Clear', cls: 'status-clear' },
    Warning: { text: '🟡 Warning', cls: 'status-warning' },
    Conflict: { text: '🔴 Conflict', cls: 'status-conflict' },
    'Requires Review': { text: '⚪ Requires Review', cls: 'status-review' },
  };
  return map[status] || map.Clear;
}

export function blockStatusTone(status) {
  if (status === 'Conflict') return 'critical';
  if (status === 'Warning') return 'medium';
  if (status === 'Requires Review') return 'plain';
  return 'low';
}

export function sortBlocks(blocks) {
  return [...blocks].sort((a, b) => {
    const o = (STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    return o || a.id.localeCompare(b.id);
  });
}