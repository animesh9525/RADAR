import { timeToMinutes } from './time';

// Ported verbatim from ai-abps.html validateBlockData()
export function validateBlockData(b) {
  const errors = [];
  if (!b) return { valid: false, errors: ['Block data missing'] };
  if (!b.corridor) errors.push('Corridor is required');
  if (!b.date) errors.push('Date is required');
  const s = timeToMinutes(b.startTime);
  const e = timeToMinutes(b.endTime);
  if (isNaN(s)) errors.push('Invalid start time');
  if (isNaN(e)) errors.push('Invalid end time');
  if (!isNaN(s) && !isNaN(e)) {
    if (e <= s) errors.push('End time must be after start time');
    if (e - s > 300) errors.push('Block duration exceeds 5h limit (300 min)');
  }
  const req = parseInt(b.requiredCrew, 10);
  const avail = parseInt(b.availableCrew, 10);
  if (!isNaN(req) && !isNaN(avail) && req > avail) errors.push('Required crew exceeds available crew');
  return { valid: errors.length === 0, errors };
}