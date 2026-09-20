import { analyzeBlockConflictsFor, detectTrainConflicts } from './conflicts';
import {
  calculateSuitabilityScore, getBlockPriorityScore, generateAIRecommendation,
  calculateRecommendationStrength, generateAIExplanation
} from './ai';
import { buildWindow, calcDurationText, minutesToTime, timeToMinutes } from './time';

export function createSimulationCopy(block) {
  return JSON.parse(JSON.stringify(block));
}

export function calculateTrainImpact(block, session) {
  const conflicts = detectTrainConflicts(block, session ? session.trainSchedule : []);
  const count = conflicts.length;
  if (count >= 1) return { label: 'High', level: 'high', count, color: 'var(--red)' };
  const sui = calculateSuitabilityScore(block, session);
  const traffic = sui.factors.traffic;
  if (traffic < 40) return { label: 'High', level: 'high', count, color: 'var(--red)' };
  if (traffic < 65) return { label: 'Medium', level: 'medium', count, color: 'var(--orange)' };
  return { label: 'Low', level: 'low', count, color: 'var(--green)' };
}

export function analyzeBlockFull(block, session) {
  const pri = getBlockPriorityScore(block, session);
  const sui = calculateSuitabilityScore(block, session);
  const conf = sui.analysis || analyzeBlockConflictsFor(block, session ? session.blocks : [], session ? session.trainSchedule : []);
  const train = calculateTrainImpact(block, session);
  const rec = generateAIRecommendation(block, session);
  const strength = calculateRecommendationStrength(block, session);
  return { block, pri, sui, conf, train, rec, strength };
}

// Mirrors runWhatIfSimulation() but pure — no DOM. Returns {ok, error?, result}.
export function runSimulation(original, modified, session) {
  if (!original) return { ok: false, error: 'Select a block first' };
  const result = {
    original: analyzeBlockFull(original, session),
    modified: analyzeBlockFull(modified, session)
  };
  return { ok: true, result };
}

export function simulationStatus(result) {
  const m = result.modified, o = result.original;
  if (m.conf.trainConflicts.length > 0 || m.conf.blockConflicts.length > 0) {
    return { status: 'High Risk', badgeCls: 'critical', icon: 'alert-triangle' };
  }
  if (m.conf.all.length > 0 || m.sui.score < 60) {
    return { status: 'Requires Review', badgeCls: 'medium', icon: 'alert-circle' };
  }
  if (Math.abs(m.sui.score - o.sui.score) < 5 && m.conf.all.length === o.conf.all.length) {
    return { status: 'Neutral', badgeCls: 'info', icon: 'minus' };
  }
  if (m.sui.score > o.sui.score) {
    return { status: 'Improved', badgeCls: 'low', icon: 'trending-up' };
  }
  return { status: 'Requires Review', badgeCls: 'medium', icon: 'alert-circle' };
}

export function comparePlans(original, modified) {
  return {
    time: { orig: original.block.startTime + ' - ' + original.block.endTime, mod: modified.block.startTime + ' - ' + modified.block.endTime, improved: false },
    conflicts: { orig: original.conf.all.length, mod: modified.conf.all.length },
    trainImpact: { orig: original.train.label, mod: modified.train.label },
    resource: { orig: original.sui.factors.resourceAvail, mod: modified.sui.factors.resourceAvail },
    suitability: { orig: original.sui.score, mod: modified.sui.score },
    priority: { orig: original.pri.score, mod: modified.pri.score },
    recommendation: { orig: original.rec.title, mod: modified.rec.title }
  };
}

export function generateImpactSummary(result) {
  const o = result.original, m = result.modified;
  const parts = [];
  if (m.conf.trainConflicts.length > o.conf.trainConflicts.length) parts.push(`introduces ${m.conf.trainConflicts.length - o.conf.trainConflicts.length} train schedule conflict(s)`);
  else if (m.conf.trainConflicts.length < o.conf.trainConflicts.length) parts.push('resolves train conflicts');
  if (m.conf.blockConflicts.length > o.conf.blockConflicts.length) parts.push(`adds block overlap with ${m.conf.blockConflicts[0].blockId}`);
  if (m.conf.resourceConflicts.length > o.conf.resourceConflicts.length) parts.push(`reduces resource availability to ${m.sui.factors.resourceAvail}%`);
  else if (m.sui.factors.resourceAvail > o.sui.factors.resourceAvail + 5) parts.push(`improves resource availability to ${m.sui.factors.resourceAvail}%`);
  if (m.sui.score < o.sui.score) parts.push(`AI Suitability Score decreased from ${o.sui.score} to ${m.sui.score}`);
  else if (m.sui.score > o.sui.score) parts.push(`AI Suitability Score improved from ${o.sui.score} to ${m.sui.score}`);
  else parts.push(`AI Suitability remains ${m.sui.score}`);
  let summary = `The modified block ${parts.join(', ')}.`;
  summary += ` Prototype analysis recommendation: ${m.rec.title} - ${m.rec.reason}`;
  return summary;
}

export function findCandidateWindows(block, session) {
  const candidates = [];
  const baseDuration = (() => {
    const s = timeToMinutes(block.startTime), e = timeToMinutes(block.endTime);
    return (!isNaN(s) && !isNaN(e)) ? e - s : 120;
  })();
  const dates = [block.date, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter((v, i, a) => a.indexOf(v) === i);
  const times = [60, 180, 360, 600, 840, 1320];
  dates.forEach(date => {
    times.forEach(startMin => {
      const endMin = startMin + baseDuration;
      if (endMin > 1440) return;
      const cand = createSimulationCopy(block);
      cand.date = date;
      cand.startTime = minutesToTime(startMin);
      cand.endTime = minutesToTime(endMin);
      cand.window = buildWindow(startMin, endMin);
      cand.duration = calcDurationText(startMin, endMin);
      if (cand.date === block.date && cand.startTime === block.startTime && cand.endTime === block.endTime) return;
      candidates.push(cand);
    });
  });
  return candidates;
}

export function analyzeCandidateWindow(candidate, session) {
  const sui = calculateSuitabilityScore(candidate, session);
  const conf = sui.analysis || analyzeBlockConflictsFor(candidate, session ? session.blocks : [], session ? session.trainSchedule : []);
  const train = calculateTrainImpact(candidate, session);
  const score = Math.round(sui.score * 0.5 + sui.factors.conflictRisk * 0.2 + sui.factors.resourceAvail * 0.15 + sui.factors.traffic * 0.1 + sui.factors.priorityAlignment * 0.05);
  let finalScore = score;
  if (conf.trainConflicts.length > 0) finalScore -= 20;
  if (conf.blockConflicts.length > 0) finalScore -= 15;
  finalScore = Math.max(0, Math.min(100, finalScore));
  return { candidate, sui, conf, train, score: finalScore };
}

export function rankCandidateWindows(candidates, session) {
  const analyzed = candidates.map(c => analyzeCandidateWindow(c, session));
  analyzed.sort((a, b) => b.score - a.score || b.sui.score - a.sui.score);
  return analyzed.slice(0, 3);
}

export function exploreCandidateWindows(block, session) {
  const ranked = rankCandidateWindows(findCandidateWindows(block, session), session);
  return ranked;
}

export { generateAIExplanation };