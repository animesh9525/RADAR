import { getBlockTimeRange, timesOverlap, timeToMinutes } from './time';

// ================= CONFLICT DETECTION — ported verbatim =================

export function detectTrainConflicts(block, trainSchedule) {
  const res = [];
  const { s, e } = getBlockTimeRange(block);
  if (isNaN(s) || isNaN(e)) return res;
  (trainSchedule || []).forEach(tr => {
    if (tr.corridor !== block.corridor) return;
    if (tr.date !== block.date) return;
    const ts = timeToMinutes(tr.start), te = timeToMinutes(tr.end);
    if (timesOverlap(s, e, ts, te)) {
      res.push({
        type: 'train',
        severity: 'critical',
        trainId: tr.id,
        corridor: tr.corridor,
        time: `${tr.start}–${tr.end}`,
        blockTime: `${block.startTime}–${block.endTime}`,
        message: `Block ${block.id} overlaps with Train ${tr.id}`,
        recommendation: 'Choose another available maintenance window.'
      });
    }
  });
  return res;
}

export function detectBlockOverlaps(block, others) {
  const res = [];
  const pool = (Array.isArray(others) ? others : []);
  const { s, e } = getBlockTimeRange(block);
  if (isNaN(s) || isNaN(e)) return res;
  pool.forEach(other => {
    if (other.id === block.id) return;
    if (other.corridor !== block.corridor) return;
    if (block.track && other.track && block.track !== 'UP & DN' && other.track !== 'UP & DN' && block.track !== other.track) return;
    if (other.date !== block.date) return;
    const { s: os, e: oe } = getBlockTimeRange(other);
    if (isNaN(os) || isNaN(oe)) return;
    if (timesOverlap(s, e, os, oe)) {
      const overlapStart = minutesToTimeLabel(Math.max(s, os));
      const overlapEnd = minutesToTimeLabel(Math.min(e, oe));
      res.push({
        type: 'block',
        severity: 'critical',
        blockId: other.id,
        corridor: other.corridor,
        time: `${other.startTime}–${other.endTime}`,
        overlap: `${overlapStart}–${overlapEnd}`,
        message: `Block ${block.id} overlaps with Block ${other.id}`,
        recommendation: 'Adjust time or corridor to avoid double booking.'
      });
    }
  });
  return res;
}

function minutesToTimeLabel(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function detectResourceConflicts(block, others) {
  const res = [];
  const pool = (Array.isArray(others) ? others : []);
  const req = parseInt(block.requiredCrew, 10);
  const avail = parseInt(block.availableCrew, 10);
  if (!isNaN(req) && !isNaN(avail) && req > avail) {
    res.push({
      type: 'resource',
      subtype: 'crew',
      severity: (req - avail >= 3 ? 'high' : 'medium'),
      required: req,
      available: avail,
      message: `Required Crew ${req} > Available ${avail}`,
      recommendation: 'Reduce scope or allocate additional crew.'
    });
  }
  if (block.equipmentStatus === 'UNAVAILABLE') {
    res.push({
      type: 'resource',
      subtype: 'equipment',
      severity: 'high',
      message: `Equipment ${block.requiredEquip || 'required'} is UNAVAILABLE`,
      recommendation: 'Use alternative equipment or reschedule.'
    });
  } else if (block.equipmentStatus === 'LIMITED') {
    res.push({
      type: 'resource',
      subtype: 'equipment',
      severity: 'medium',
      message: `Equipment ${block.requiredEquip || 'required'} is LIMITED`,
      recommendation: 'Confirm availability before confirming.'
    });
  }
  const { s, e } = getBlockTimeRange(block);
  pool.forEach(other => {
    if (other.id === block.id) return;
    if (other.date !== block.date) return;
    if (other.corridor !== block.corridor) return;
    const { s: os, e: oe } = getBlockTimeRange(other);
    if (timesOverlap(s, e, os, oe)) {
      if (block.requiredEquip && other.requiredEquip && block.requiredEquip === other.requiredEquip && (block.equipmentStatus !== 'AVAILABLE' || other.equipmentStatus !== 'AVAILABLE')) {
        if (!res.some(r => r.subtype === 'equipment' && r.message.includes(block.requiredEquip))) {
          res.push({
            type: 'resource',
            subtype: 'equipment-overlap',
            severity: 'medium',
            message: `Resource ${block.requiredEquip} also required by overlapping Block ${other.id}`,
            recommendation: 'Stagger blocks or allocate separate equipment.'
          });
        }
      }
    }
  });
  return res;
}

export function analyzeBlockConflicts(block, others) {
  const trainConflicts = detectTrainConflicts(block, block.__trains || []);
  const blockConflicts = detectBlockOverlaps(block, others);
  const resourceConflicts = detectResourceConflicts(block, others);
  const all = [...trainConflicts, ...blockConflicts, ...resourceConflicts];
  let severity = 'No Conflict';
  let level = 'clear';
  if (trainConflicts.length > 0 || blockConflicts.length > 0) {
    severity = 'Critical';
    level = 'critical';
  } else if (resourceConflicts.some(r => r.severity === 'high')) {
    severity = 'High';
    level = 'high';
  } else if (resourceConflicts.some(r => r.severity === 'medium')) {
    severity = 'Medium';
    level = 'medium';
  }
  return { trainConflicts, blockConflicts, resourceConflicts, all, severity, level, hasConflict: all.length > 0, hasCritical: trainConflicts.length > 0 || blockConflicts.length > 0 };
}

// Variant used by the app: threads the live train schedule through.
export function analyzeBlockConflictsFor(block, others, trainSchedule) {
  const trainConflicts = detectTrainConflicts(block, trainSchedule);
  const blockConflicts = detectBlockOverlaps(block, others);
  const resourceConflicts = detectResourceConflicts(block, others);
  const all = [...trainConflicts, ...blockConflicts, ...resourceConflicts];
  let severity = 'No Conflict';
  let level = 'clear';
  if (trainConflicts.length > 0 || blockConflicts.length > 0) {
    severity = 'Critical';
    level = 'critical';
  } else if (resourceConflicts.some(r => r.severity === 'high')) {
    severity = 'High';
    level = 'high';
  } else if (resourceConflicts.some(r => r.severity === 'medium')) {
    severity = 'Medium';
    level = 'medium';
  }
  return { trainConflicts, blockConflicts, resourceConflicts, all, severity, level, hasConflict: all.length > 0, hasCritical: trainConflicts.length > 0 || blockConflicts.length > 0 };
}

export function getSeverityLabel(level) {
  const map = { critical: 'Critical', high: 'High', medium: 'Medium', clear: 'No Conflict' };
  return map[level] || map.clear;
}

// Filter helper shared by Conflict Center (ported from renderConflictCenter filters)
export function filterConflicts(blocksConflicts) {
  const list = [];
  blocksConflicts.forEach(({ block, analysis }) => {
    analysis.trainConflicts.forEach(c => list.push({ block, kind: 'train', ...c }));
    analysis.blockConflicts.forEach(c => list.push({ block, kind: 'block', ...c }));
    analysis.resourceConflicts.forEach(c => list.push({ block, kind: 'resource', ...c }));
  });
  return list;
}