import { analyzeBlockConflictsFor } from './conflicts';
import { calculatePriorityScore, calculateSuitabilityScore } from './ai';
import { createSimulationCopy, findCandidateWindows } from './whatif';

// ================= BEFORE vs AFTER AI OPTIMIZATION — ported verbatim =================
// Prototype feature reusing the conflict, suitability and candidate-window logic.

export function aiPlanMetrics(blocks, session) {
  const taskData = session ? session.taskData : {};
  const list = blocks || [];
  const analysis = list.map(b => analyzeBlockConflictsFor(b, list, session ? session.trainSchedule : []));
  let train = 0, block = 0, resource = 0, hpU = 0;
  list.forEach((b, idx) => {
    const an = analysis[idx];
    train += an.trainConflicts.length;
    block += an.blockConflicts.length;
    resource += an.resourceConflicts.length;
    if (an.hasConflict && Array.isArray(b.tasks)) {
      b.tasks.forEach(t => {
        const full = taskData[t.id];
        const tsk = full ? { id: t.id, ...full } : { priority: b.priority || 'MEDIUM', department: t.department || 'Engineering', corridor: b.corridor, duration: t.duration || '60 min', due: 'Friday', risk: 60 };
        if (calculatePriorityScore(tsk).score >= 70) hpU++;
      });
    }
  });
  let avgUtil = 0, effUtil = 0;
  const clean = list.map((b, idx) => {
    const u = parseInt(String(b.utilization || '0%').replace('%', ''), 10);
    return { u: isNaN(u) ? 0 : u, has: analysis[idx].hasConflict };
  });
  avgUtil = clean.length ? Math.round(clean.reduce((s, c) => s + c.u, 0) / clean.length) : 0;
  effUtil = clean.length ? Math.round(clean.reduce((s, c) => s + (c.has ? 0 : c.u), 0) / clean.length) : 0;
  return {
    conflicts: train + block + resource,
    train, block, resource,
    highPriUnresolved: hpU,
    review: analysis.filter(a => a.hasConflict).length,
    effUtil, avgUtil,
    totalBlocks: list.length
  };
}

export function aiMetricList(m) {
  return [
    { k: 'Conflicts', v: m.conflicts, s: '' },
    { k: 'Train Schedule Conflicts', v: m.train, s: '' },
    { k: 'Resource Conflicts', v: m.resource, s: '' },
    { k: 'High-Priority Tasks Blocked', v: m.highPriUnresolved, s: '' },
    { k: 'Effective Utilization', v: m.effUtil, s: '%' },
    { k: 'Blocks Needing Review', v: m.review, s: '' }
  ];
}

export function aiPlanChangesSummary(methods) {
  let text = 'The optimizer moved conflicting blocks to scored candidate windows and reallocated reserve resources, which ';
  const parts = [];
  if (methods.afterConflicts < methods.beforeConflicts) parts.push(`resolves <b>${methods.beforeConflicts - methods.afterConflicts} conflict(s)</b> (${methods.beforeConflicts} → ${methods.afterConflicts})`);
  if (methods.afterEffUtil > methods.beforeEffUtil) parts.push(`raises <b>effective utilization</b> from ${methods.beforeEffUtil}% to ${methods.afterEffUtil}%`);
  if (methods.afterHpu < methods.beforeHpu) parts.push(`unblocks <b>${methods.beforeHpu - methods.afterHpu} high-priority task(s)</b>`);
  if (!parts.length) parts.push('keeps the plan unchanged');
  return text + parts.join(', ') + '.';
}

// aiBuildOptimizedPlan — pure port. Never mutates the caller's blocks.
export function aiBuildOptimizedPlan(blocks, session) {
  const taskData = session ? session.taskData : {};
  const trains = session ? session.trainSchedule : [];
  const working = blocks.map(b => createSimulationCopy(b));
  const changes = [];
  const findChange = id => changes.find(c => c.id === id);

  working.forEach((wb, idx) => {
    const orig = blocks[idx];
    const conf0 = analyzeBlockConflictsFor(wb, working, trains);
    if (!conf0.hasConflict) return;
    const candidates = findCandidateWindows(orig, session);
    let best = null;
    candidates.forEach(cand => {
      const conf = analyzeBlockConflictsFor(cand, working, trains);
      if (conf.trainConflicts.length > 0 || conf.blockConflicts.length > 0) return;
      const sui = calculateSuitabilityScore(cand, session);
      const score = Math.round(sui.score * 0.6 + sui.factors.resourceAvail * 0.2 + sui.factors.traffic * 0.1 + sui.factors.priorityAlignment * 0.1);
      if (!best || score > best.score) best = { cand, conf, sui, score };
    });
    if (best) {
      const upd = best.cand;
      upd.status = 'Requires Review';
      working[idx] = upd;
      changes.push({
        id: orig.id,
        moved: true,
        before: orig,
        after: upd,
        beforeConf: conf0,
        afterConf: best.conf,
        trainCleared: conf0.trainConflicts.map(c => c.trainId).filter(tid => !best.conf.trainConflicts.some(c => c.trainId === tid)),
        blockCleared: conf0.blockConflicts.map(c => c.blockId).filter(bid => !best.conf.blockConflicts.some(c => c.blockId === bid)),
        resourceCleared: [],
        reason: 'Time window moved to a scored conflict-free alternative'
      });
    } else {
      changes.push({ id: orig.id, moved: false, before: orig, after: orig, beforeConf: conf0, afterConf: conf0, trainCleared: [], blockCleared: [], resourceCleared: [], reason: 'No conflict-free window available' });
    }
  });

  working.forEach((wb, idx) => {
    const conf = analyzeBlockConflictsFor(wb, working, trains);
    if (!conf.resourceConflicts.length) return;
    const entry = findChange(wb.id);
    const upd = createSimulationCopy(wb);
    const crewDefs = conf.resourceConflicts.filter(r => r.subtype === 'crew');
    const equipDefs = conf.resourceConflicts.filter(r => r.subtype === 'equipment' || r.subtype === 'equipment-overlap');
    if (crewDefs.length) {
      const need = parseInt(upd.requiredCrew, 10);
      if (!isNaN(need)) upd.availableCrew = need;
    }
    if (equipDefs.length) upd.equipmentStatus = 'AVAILABLE';
    const conf2 = analyzeBlockConflictsFor(upd, working, trains);
    if (conf2.all.length < conf.all.length) {
      upd.status = 'Requires Review';
      working[idx] = upd;
      const cleared = [].concat(crewDefs.length ? ['crew'] : []).concat(equipDefs.length ? ['equipment'] : []);
      if (entry) {
        entry.after = upd;
        entry.afterConf = conf2;
        entry.resourceCleared = (entry.resourceCleared || []).concat(cleared);
      } else {
        changes.push({ id: wb.id, moved: false, resourceOnly: true, before: wb, after: upd, beforeConf: conf, afterConf: conf2, trainCleared: [], blockCleared: [], resourceCleared: cleared, reason: 'Resources reallocated from reserve' });
      }
    }
  });

  return { working, changes: changes.filter(c => c.moved || c.resourceOnly) };
}

export function aiChangeDescription(c) {
  let desc;
  if (c.moved) {
    desc = `${c.id} moved from ${c.before.date} ${c.before.startTime}–${c.before.endTime} → ${c.after.date} ${c.after.startTime}–${c.after.endTime}`;
    const cleared = [];
    if (c.trainCleared.length) cleared.push(c.trainCleared.length + ' train conflict(s)');
    if (c.blockCleared.length) cleared.push('block overlap');
    if (c.resourceCleared.length) cleared.push(c.resourceCleared.join('+') + ' resource');
    if (cleared.length) desc += ' — cleared ' + cleared.join(', ');
  } else if (c.resourceOnly) {
    desc = `${c.id} resource reallocation — cleared ${(c.resourceCleared || []).join(', ')} deficit without changing the window`;
  } else {
    desc = `${c.id} no conflict-free window available — kept as-is`;
  }
  return desc;
}