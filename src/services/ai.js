import { analyzeBlockConflictsFor } from './conflicts';
import { getBlockTimeRange, timesOverlap, timeToMinutes } from './time';

// ================= AI INTELLIGENCE LAYER — ported verbatim =================
// These are prototype/demo calculations (synthetic data, no trained ML model).

// Derive Priority Factors is deterministic: any Math.random() term in the
// original resolves to 0 (`Math.random()*0|0`), so scores are stable.
export function derivePriorityFactors(task) {
  const priorityMap = { CRITICAL: 95, HIGH: 80, MEDIUM: 55, LOW: 30 };
  const dueStr = (task.due || '').toLowerCase();
  let urgency = 50;
  if (dueStr.includes('overdue')) urgency = 95;
  else if (dueStr.includes('today')) urgency = 90;
  else if (dueStr.includes('tomorrow')) urgency = 75;
  else if (dueStr.includes('tuesday')) urgency = 65;
  else if (dueStr.includes('wednesday')) urgency = 60;
  else if (dueStr.includes('thursday')) urgency = 55;
  else if (dueStr.includes('friday')) urgency = 50;
  else urgency = 60;

  let delayImpact = urgency;
  if (dueStr.includes('overdue')) delayImpact = 92;
  else if (dueStr.includes('today')) delayImpact = 85;

  let safety = priorityMap[task.priority] || 50;
  if (task.department === 'Engineering' && (task.priority === 'CRITICAL' || task.priority === 'HIGH')) safety = Math.min(100, safety + 5);
  if (task.risk && task.risk > 85) safety = Math.min(100, safety + 3);

  let asset = task.risk ? Math.max(0, Math.min(100, task.risk + 0)) : 60;

  const corridorImpactMap = { C1: 85, C2: 70, C3: 65, C4: 60 };
  let operational = corridorImpactMap[task.corridor] || 60;
  const dur = parseInt(task.duration) || 60;
  if (dur >= 85) operational = Math.min(100, operational + 8);
  else if (dur <= 30) operational = Math.max(0, operational - 5);

  return {
    safety: Math.round(safety),
    asset: Math.round(asset),
    urgency: Math.round(urgency),
    delayImpact: Math.round(delayImpact),
    operational: Math.round(operational)
  };
}

export function calculatePriorityScore(task) {
  if (!task) return { score: 0, factors: { safety: 0, asset: 0, urgency: 0, delayImpact: 0, operational: 0 } };
  const f = derivePriorityFactors(task);
  const score = Math.round(f.safety * 0.30 + f.asset * 0.25 + f.urgency * 0.20 + f.delayImpact * 0.15 + f.operational * 0.10);
  return { score: Math.max(0, Math.min(100, score)), factors: f };
}

export function getPriorityCategory(score) {
  if (score >= 85) return { label: 'CRITICAL', cls: 'critical' };
  if (score >= 70) return { label: 'HIGH', cls: 'high' };
  if (score >= 40) return { label: 'MEDIUM', cls: 'medium' };
  return { label: 'LOW', cls: 'low' };
}

export function getBlockPriorityScore(block, session) {
  if (!block || !block.tasks || !block.tasks.length) {
    const dummyTask = { priority: block ? block.priority : 'MEDIUM', department: 'Engineering', corridor: block ? block.corridor : 'C1', duration: block ? block.duration : '60 min', due: 'Friday', risk: 60 };
    return calculatePriorityScore(dummyTask);
  }
  const taskData = session ? session.taskData : {};
  const scores = block.tasks.map(t => {
    const full = taskData[t.id];
    if (full) return calculatePriorityScore({ id: t.id, ...full }).score;
    return calculatePriorityScore({
      priority: block.priority || 'MEDIUM',
      department: t.department || 'Engineering',
      corridor: block.corridor,
      duration: t.duration || '60 min',
      due: 'Friday',
      risk: 60
    }).score;
  });
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const max = Math.max(...scores);
  const blended = Math.round(avg * 0.7 + max * 0.3);
  const factorSets = block.tasks.map(t => {
    const full = taskData[t.id];
    if (full) return derivePriorityFactors({ id: t.id, ...full });
    return derivePriorityFactors({
      priority: block.priority || 'MEDIUM',
      department: t.department || 'Engineering',
      corridor: block.corridor,
      duration: t.duration || '60 min',
      due: 'Friday',
      risk: 60
    });
  });
  const avgFactors = { safety: 0, asset: 0, urgency: 0, delayImpact: 0, operational: 0 };
  ['safety', 'asset', 'urgency', 'delayImpact', 'operational'].forEach(k => {
    avgFactors[k] = Math.round(factorSets.reduce((s, f) => s + f[k], 0) / factorSets.length);
  });
  return { score: blended, factors: avgFactors, individual: scores };
}

export function calculateSuitabilityScore(block, session) {
  if (!block) return { score: 0, factors: { priorityAlignment: 0, corridorAvail: 0, resourceAvail: 0, traffic: 0, conflictRisk: 0, taskCompat: 0 } };
  const taskData = session ? session.taskData : {};
  const trains = session ? session.trainSchedule : [];
  const blocks = session ? session.blocks : [];
  const priorityScore = getBlockPriorityScore(block, session).score;

  let priorityAlignment = Math.min(100, 60 + (priorityScore - 50) * 0.6);

  const sameCorridorDay = blocks.filter(b => b.id !== block.id && b.corridor === block.corridor && b.date === block.date).length;
  let corridorAvail = Math.max(20, 95 - sameCorridorDay * 18);

  const req = parseInt(block.requiredCrew, 10);
  const avail = parseInt(block.availableCrew, 10);
  let resourceAvail = 85;
  if (!isNaN(req) && !isNaN(avail)) {
    if (avail >= req) resourceAvail = 90 + Math.min(10, (avail - req) * 3);
    else {
      const deficit = req - avail;
      resourceAvail = Math.max(10, 70 - deficit * 15);
    }
  }
  if (block.equipmentStatus === 'UNAVAILABLE') resourceAvail = Math.min(resourceAvail, 30);
  else if (block.equipmentStatus === 'LIMITED') resourceAvail = Math.min(resourceAvail, 60);
  resourceAvail = Math.max(0, Math.min(100, Math.round(resourceAvail)));

  const trainsSameCorridor = trains.filter(t => t.corridor === block.corridor && t.date === block.date).length;
  let traffic = Math.max(20, 90 - trainsSameCorridor * 15);
  const { s, e } = getBlockTimeRange(block);
  let overlappingTrains = 0;
  trains.forEach(t => {
    if (t.corridor !== block.corridor || t.date !== block.date) return;
    const ts = timeToMinutes(t.start), te = timeToMinutes(t.end);
    if (timesOverlap(s, e, ts, te)) overlappingTrains++;
  });
  if (overlappingTrains > 0) traffic = Math.max(10, traffic - overlappingTrains * 20);
  traffic = Math.max(0, Math.min(100, Math.round(traffic)));

  const analysis = analyzeBlockConflictsFor(block, blocks, trains);
  let conflictRisk = 95;
  if (analysis.trainConflicts.length > 0) conflictRisk = 25;
  else if (analysis.blockConflicts.length > 0) conflictRisk = 35;
  else if (analysis.resourceConflicts.some(r => r.severity === 'high')) conflictRisk = 45;
  else if (analysis.resourceConflicts.some(r => r.severity === 'medium')) conflictRisk = 65;
  else if (analysis.all.length > 0) conflictRisk = 70;

  let taskCompat = 70;
  if (block.type === 'COMBINED' && block.tasks.length > 1) {
    const depts = new Set(block.tasks.map(t => t.department));
    if (depts.size > 1) taskCompat = 88;
    else taskCompat = 82;
    if (analysis.all.length > 0) taskCompat = Math.max(30, taskCompat - 30);
  } else if (block.type === 'SINGLE') {
    taskCompat = 75;
    if (block.tasks.length === 1 && (block.tasks[0].duration || '').includes('90')) taskCompat = 80;
  }
  taskCompat = Math.max(0, Math.min(100, Math.round(taskCompat)));

  const score = Math.round(priorityAlignment * 0.20 + corridorAvail * 0.20 + resourceAvail * 0.15 + traffic * 0.15 + conflictRisk * 0.20 + taskCompat * 0.10);
  return {
    score: Math.max(0, Math.min(100, score)),
    factors: {
      priorityAlignment: Math.round(priorityAlignment),
      corridorAvail: Math.round(corridorAvail),
      resourceAvail: Math.round(resourceAvail),
      traffic: Math.round(traffic),
      conflictRisk: Math.round(conflictRisk),
      taskCompat: Math.round(taskCompat)
    },
    analysis
  };
}

export function getSuitabilityCategory(score) {
  if (score >= 90) return { label: 'EXCELLENT', cls: 'low' };
  if (score >= 70) return { label: 'GOOD', cls: 'info' };
  if (score >= 50) return { label: 'MODERATE', cls: 'medium' };
  return { label: 'HIGH RISK', cls: 'critical' };
}

export function generateAIRecommendation(block, session) {
  const pri = getBlockPriorityScore(block, session);
  const sui = calculateSuitabilityScore(block, session);
  const analysis = sui.analysis || analyzeBlockConflictsFor(block, session ? session.blocks : [], session ? session.trainSchedule : []);
  const hasTrain = analysis.trainConflicts.length > 0;
  const hasBlockOverlap = analysis.blockConflicts.length > 0;
  const hasResource = analysis.resourceConflicts.length > 0;
  const hasHighResource = analysis.resourceConflicts.some(r => r.severity === 'high');
  let type, title, reason, badgeCls;
  if (hasTrain || hasBlockOverlap) {
    type = 'CHANGE_BLOCK_TIMING';
    title = 'Change Block Timing';
    badgeCls = 'ai-reco-change';
    if (hasTrain) reason = `A train schedule conflict was detected during the selected maintenance window (${analysis.trainConflicts[0].trainId} ${analysis.trainConflicts[0].time}). The overlap reduces suitability and requires rescheduling.`;
    else reason = `The block overlaps with ${analysis.blockConflicts[0].blockId} in corridor ${analysis.blockConflicts[0].corridor} (${analysis.blockConflicts[0].overlap}). Reschedule to avoid double booking.`;
  } else if (hasHighResource || (hasResource && sui.score < 60)) {
    type = 'REVIEW_RESOURCE_ALLOCATION';
    title = 'Review Resource Allocation';
    badgeCls = 'ai-reco-resource';
    reason = `Resource availability is limited: ${analysis.resourceConflicts[0].message}. Allocate additional crew/equipment or adjust scope.`;
  } else if (sui.score >= 70 && !hasTrain && !hasBlockOverlap && !hasResource) {
    type = 'KEEP_CURRENT_PLAN';
    title = 'Keep Current Plan';
    badgeCls = 'ai-reco-keep';
    reason = `No critical conflicts detected. Resources are available (crew ${block.availableCrew}/${block.requiredCrew}), corridor ${block.corridor} has good availability, and suitability is ${sui.score}/100.`;
  } else {
    type = 'REVIEW_BLOCK';
    title = 'Review Block Timing';
    badgeCls = 'ai-reco-review';
    if (hasResource) reason = `Suitability is moderate (${sui.score}/100) due to limited resources: ${analysis.resourceConflicts[0].message}. Review timing or allocation.`;
    else if (sui.factors.corridorAvail < 60) reason = `Corridor availability is constrained for ${block.corridor} on ${block.date}. Consider alternative window for better throughput.`;
    else if (sui.factors.traffic < 60) reason = 'Traffic conditions are elevated for this window. A less congested slot would improve suitability.';
    else reason = `Suitability is moderate (${sui.score}/100). Review timing, resources, and task compatibility before confirming.`;
  }
  return { type, title, reason, badgeCls, pri, sui, analysis };
}

export function calculateRecommendationStrength(block, session) {
  const rec = generateAIRecommendation(block, session);
  const sui = rec.sui.score;
  const pri = rec.pri.score;
  let strength;
  if (rec.type === 'KEEP_CURRENT_PLAN') strength = Math.round(70 + (sui - 70) * 0.4 + (pri > 70 ? 10 : 0));
  else if (rec.type === 'CHANGE_BLOCK_TIMING') strength = Math.round(80 + (100 - sui) * 0.1);
  else if (rec.type === 'REVIEW_RESOURCE_ALLOCATION') strength = Math.round(75 + (100 - rec.sui.factors.resourceAvail) * 0.15);
  else strength = Math.round(65 + (100 - sui) * 0.15);
  strength = Math.max(55, Math.min(96, strength));
  return { strength, rec };
}

export function generateAIExplanation(block, session) {
  const pri = getBlockPriorityScore(block, session);
  const sui = calculateSuitabilityScore(block, session);
  const rec = generateAIRecommendation(block, session);
  const catP = getPriorityCategory(pri.score);
  const catS = getSuitabilityCategory(sui.score);
  let lines = [];
  if (pri.score >= 70) {
    lines.push(`Priority is ${catP.label} (${pri.score}/100) due to ${pri.factors.safety >= 80 ? `high safety criticality (${pri.factors.safety}%)` : `safety ${pri.factors.safety}%`}, asset criticality ${pri.factors.asset}%, and urgency ${pri.factors.urgency}%.`);
  } else if (pri.score >= 40) {
    lines.push(`Priority is ${catP.label} (${pri.score}/100)  moderate urgency and asset criticality.`);
  } else {
    lines.push(`Priority is ${catP.label} (${pri.score}/100)  low urgency and routine asset impact.`);
  }
  if (sui.score >= 70) {
    lines.push(`Suitability is ${catS.label} (${sui.score}/100) with good corridor availability (${sui.factors.corridorAvail}%), available resources (${sui.factors.resourceAvail}%), and low conflict risk (${sui.factors.conflictRisk}%).`);
  } else {
    const weak = [];
    if (sui.factors.corridorAvail < 60) weak.push(`corridor availability ${sui.factors.corridorAvail}%`);
    if (sui.factors.resourceAvail < 60) weak.push(`resource availability ${sui.factors.resourceAvail}%`);
    if (sui.factors.conflictRisk < 60) weak.push(`conflict risk ${sui.factors.conflictRisk}%`);
    if (sui.factors.traffic < 60) weak.push(`traffic conditions ${sui.factors.traffic}%`);
    if (sui.factors.taskCompat < 60) weak.push(`task compatibility ${sui.factors.taskCompat}%`);
    lines.push(`Suitability is ${catS.label} (${sui.score}/100) reduced by ${weak.length ? weak.join(', ') : 'multiple factors'}.`);
  }
  if (rec.analysis.trainConflicts.length > 0) {
    lines.push(`Train conflict: overlaps with ${rec.analysis.trainConflicts[0].trainId} (${rec.analysis.trainConflicts[0].time}), lowering suitability and requiring reschedule.`);
  }
  if (rec.analysis.blockConflicts.length > 0) {
    lines.push(`Block overlap: conflicts with ${rec.analysis.blockConflicts[0].blockId} (${rec.analysis.blockConflicts[0].overlap}) in ${block.corridor}.`);
  }
  if (rec.analysis.resourceConflicts.length > 0) {
    lines.push(`Resource constraint: ${rec.analysis.resourceConflicts[0].message} (availability ${sui.factors.resourceAvail}%).`);
  }
  if (rec.analysis.all.length === 0) {
    lines.push('No critical conflicts detected in prototype analysis; traffic and resources are favorable.');
  }
  lines.push(`Recommendation '${rec.title}' follows because ${rec.reason}`);
  return { pri, sui, rec, catP, catS, text: lines.join(' ') };
}

export function refreshDashboardMetrics(tasksList, session) {
  const tasks = (tasksList || []).map(t => calculatePriorityScore(t));
  const critical = tasks.filter(t => t.score >= 85).length;
  const high = tasks.filter(t => t.score >= 70 && t.score < 85).length;
  const blocks = (session ? session.blocks : []).map(b => calculateSuitabilityScore(b, session));
  const highSuit = blocks.filter(b => b.score >= 90).length;
  const needReview = (session ? session.blocks : []).filter(b => b.status === 'Conflict' || b.status === 'Requires Review').length;
  return { critical, high, highSuit, needReview, total: tasks.length };
}