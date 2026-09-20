import { analyzeBlockConflictsFor } from './conflicts';
import { calculateSuitabilityScore, generateAIRecommendation } from './ai';

// ================= APPROVAL & AUDIT — ported verbatim =================

export function getApprovalStatus(approvals, id) {
  return approvals[id] || { category: 'pending' };
}

export function getConflictSummaryForBlock(b, session) {
  if (!b) return '—';
  try {
    const analysis = analyzeBlockConflictsFor(b, session ? session.blocks : [], session ? session.trainSchedule : []);
    const parts = [];
    if (analysis.trainConflicts.length) parts.push(analysis.trainConflicts.length + ' train');
    if (analysis.blockConflicts.length) parts.push(analysis.blockConflicts.length + ' overlap');
    if (analysis.resourceConflicts.length) parts.push(analysis.resourceConflicts.length + ' resource');
    return parts.length ? parts.join(', ') : 'None';
  } catch (e) {
    return b.status && b.status !== 'Clear' ? b.status : 'None';
  }
}

export function isApprovalOverride(recommendationType, action) {
  if (action === 'reject') return true;
  if (recommendationType === 'KEEP_CURRENT_PLAN' && action === 'approve') return false;
  if (recommendationType === 'CHANGE_BLOCK_TIMING' && action === 'approve') return false;
  // Any approval that contradicts the AI recommendation classifies as a manual override
  return true;
}

export function decisionIsOverride(message) {
  const category = (message || '').toLowerCase();
  if (category.includes('manual')) return true;
  if (category.includes('override')) return true;
  return false;
}

export function recordApproval(approvals, block, category, reason, overrideReason, currentUser, session) {
  const now = Date.now();
  let aiRecType = '';
  try {
    aiRecType = generateAIRecommendation(block, session).type;
  } catch (e) { /* prototype guard */ }
  const next = { ...approvals };
  next[block.id] = {
    category,
    reason: reason || '',
    by: currentUser || 'Demo Planner',
    name: currentUser || 'Demo Planner',
    time: now,
    aiRecType
  };
  return { approvals: next, aiRecType, time: now };
}

export function makeAudit(category, message, reason, blockId, isOverride, currentUser) {
  return {
    category,
    message,
    reason: reason || '',
    blockId: blockId || '',
    isOverride: !!isOverride,
    by: currentUser || 'Demo Planner',
    time: Date.now()
  };
}

export function pushAudit(records, record) {
  const next = [record, ...records];
  if (next.length > 50) next.pop();
  return next;
}

export function approvalSummary(blocks, approvals) {
  const decisions = blocks.map(b => getApprovalStatus(approvals, b.id));
  const pending = decisions.filter(d => d.category === 'pending' || d.category === 'requires').length;
  const approved = decisions.filter(d => d.category === 'approved').length;
  const rejected = decisions.filter(d => d.category === 'rejected').length;
  return { pending, approved, rejected, total: blocks.length };
}

export function filterAudit(records, filter) {
  if (filter === 'approvals') return records.filter(r => r.category === 'approval');
  if (filter === 'rejections') return records.filter(r => r.category === 'rejection');
  if (filter === 'overrides') return records.filter(r => r.isOverride);
  if (filter === 'edits') return records.filter(r => r.category === 'edit');
  return records;
}

export { calculateSuitabilityScore };