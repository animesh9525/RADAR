import { getApprovalStatus } from './approval';
import {
  calculatePriorityScore, calculateSuitabilityScore, generateAIRecommendation
} from './ai';

// ================= AI ASSISTANT — ported verbatim =================
// Pattern-based prototype responder (askAI) + contextual floating reply.

export function chatAnswer(question) {
  const q = (question || '').toLowerCase();

  if (q.includes('b-042') || q.includes('why was')) {
    return "B-042 was selected because T102, S143 and O221 are all located within the C1 planning area. The optimizer found a 12:00–14:00 window with zero train conflicts, sufficient duration for all three tasks, and available crew. This bundling improves block utilization from ~50% to 92%.";
  }
  if (q.includes('critical')) {
    return "The main critical task is T102 (Track Defect) in Corridor C1 with AI priority 92/100. It's overdue by 3 days with high safety criticality. Other critical tasks include T119 (Track Inspection, 81) and O310 (OHE Preventive, 76).";
  }
  if (q.includes('unavailable') || q.includes('what if')) {
    return "If a block becomes unavailable, the optimizer: (1) removes that window, (2) protects critical tasks by finding next-best windows, (3) attempts to reschedule compatible tasks together, (4) reports any unavoidable delays. The what-if simulator lets you test specific scenarios.";
  }
  if (q.includes('bundled') || q.includes('combine') || q.includes('bundling')) {
    return "The AI bundles tasks when they: share the same corridor, have compatible locations, fit within available duration, don't have resource conflicts, and satisfy safety rules. Current bundled blocks: B-042 (3 tasks), B-041 (2), B-045 (2), B-047 (2), B-049 (2). Tasks stay separate when bundling provides little benefit or requires dedicated resources.";
  }
  if (q.includes('compare') || q.includes('manual')) {
    return "AI plan vs manual baseline: Blocks reduced from 9 to 6 (-33%), tasks planned increased from 14 to 18 (+29%), utilization improved from 61% to 87% (+26%), conflicts resolved from 4 to 0, bundled tasks increased from 2 to 7.";
  }
  if (q.includes('summary') || q.includes('report')) {
    return "Weekly Summary (Aug 24-30): 18 tasks across 4 corridors, 6 optimized blocks (4 combined), 87% average utilization, 0 unresolved conflicts, 94% asset availability. Critical attention needed: T102 (overdue), Traction Team 3 capacity.";
  }
  if (q.includes('risk')) {
    return "This week's risks: (1) T102 overdue — safety critical, (2) Traction Team 3 understaffed for O221, (3) C2 goods traffic peak on Wednesday may affect B-045 execution, (4) Equipment: OHE Maintenance Unit reserved — backup available.";
  }
  if (q.includes('safety') || q.includes('constraint')) {
    return "Safety constraints are HARD constraints that cannot be overridden: minimum buffer between train and maintenance, electrical isolation rules, signaling interlock requirements, crew certification requirements, and weather thresholds. The optimizer treats these as inviolable.";
  }
  return "I can help with: task priorities, block recommendations, bundling logic, conflict resolution, what-if scenarios, resource planning, and safety constraints. Try asking about specific tasks, blocks, or corridors.";
}

export function buildFloatingReply(q, session, screen) {
  const s = (q || '').toLowerCase();
  const blocks = session ? session.blocks : [];

  if (s.indexOf('conflict') !== -1 || s.indexOf('attention') !== -1 || s.indexOf('alert') !== -1) {
    const active = blocks.filter(b => b.status === 'Conflict' || (b.conflicts && b.conflicts.length));
    if (active.length === 0) {
      return 'There are currently no blocks flagged with conflicts.';
    }
    const first = active[0];
    const types = first.conflicts && first.conflicts.map(c => c.type).join(', ') || first.status;
    return `Currently <b>${active.length}</b> block(s) require attention. Example: <b>${first.id}</b> on ${first.corridor}/${first.track} — ${types}. Open Conflict Center for details.`;
  }
  if (s.indexOf('recommend') !== -1) {
    const rec = blocks.find(b => b.aiRecommendation && b.aiRecommendation.title);
    if (!rec) return 'Open a block detail to view its AI recommendation.';
    return `<b>${rec.id}</b>: ${rec.aiRecommendation.title} — Priority ${rec.priorityScore || 'n/a'}, Suitability ${rec.suitabilityScore || 'n/a'}. View Details for the full explanation.`;
  }
  if (s.indexOf('block') !== -1 && s.indexOf('explain') !== -1) {
    return 'Select a block and open its details to see the explainable AI factors: Priority Score, Suitability Score, and Recommendation with reasoning.';
  }
  if (s.indexOf('approval') !== -1 && (s.indexOf('how') !== -1 || s.indexOf('work') !== -1)) {
    return 'The Approval Center implements a human-in-the-loop workflow: AI recommends a decision per block (Approve, Change Timing, Review Resources, etc.), but only an authorized human can finalize it. Approving or rejecting a decision that differs from the AI recommendation flags it as a Human Override and asks for a reason. Every action is written to the Audit Log so the workflow is auditable and accountable.';
  }
  if (s.indexOf('pending') !== -1 || s.indexOf('review status') !== -1 || s.indexOf('approval') !== -1) {
    const approvals = session ? session.approvals : {};
    const pending = blocks.filter(b => { const a = getApprovalStatus(approvals, b.id); return a.category === 'pending' || a.category === 'requires'; });
    const approved = blocks.filter(b => getApprovalStatus(approvals, b.id).category === 'approved').length;
    const rejected = blocks.filter(b => getApprovalStatus(approvals, b.id).category === 'rejected').length;
    return `Approval status: <b>${pending.length}</b> pending, <b>${approved}</b> approved, <b>${rejected}</b> rejected${pending[0] ? ('. Next to review: <b>' + pending[0].id + '</b> (' + pending[0].corridor + ').') : '.'} Open Approval & Audit to act on them.`;
  }
  if (s.indexOf('recent decision') !== -1 || s.indexOf('audit') !== -1) {
    const audit = session ? session.auditRecords : [];
    if (!audit.length) return 'No decisions have been recorded yet. Approve or reject blocks to build the audit log.';
    const last = audit[0];
    return `Most recent action: <b>${last.category.toUpperCase()}</b> — ${last.message}${last.reason ? (' Reason: ' + last.reason) : ''} at ${new Date(last.time).toLocaleString()}.`;
  }
  if (s.indexOf('whatif') !== -1 || s.indexOf('simulat') !== -1 || s.indexOf('scenario') !== -1) {
    return 'Use the What-If Simulator to clone a plan, modify it, and compare Original vs Modified impact, then re-optimize.';
  }
  if (s.indexOf('window') !== -1) {
    return 'The AI evaluates candidate time windows using conflict, traffic, resource, and priority factors. Open block details and choose "Find a better planning window".';
  }
  if (s.indexOf('dashboard') !== -1 || s.indexOf('hello') !== -1 || s.indexOf('hi') !== -1) {
    return 'I am your Prototype AI Planning Assistant. I can explain conflicts, recommendations, and where to find things. Ask me about blocks, conflicts, or trends.';
  }
  return 'I am a prototype assistant using synthetic data. Try asking "What requires attention?", "Show active conflicts", or "Explain AI recommendations".';
}

export function quickWhere(question, session) {
  const q = (question || '').toLowerCase();
  const touches = {
    '/tasks': ['task', 'planner', 'block planner', 'kanban'],
    '/schedule': ['weekly', 'schedule', 'week'],
    '/monthly': ['monthly'],
    '/network': ['network', 'netops', 'map', 'satellite'],
    '/what-if': ['what-if', 'whatif', 'simulation', 'scenario'],
    '/conflicts': ['conflict', 'attention', 'alert'],
    '/resources': ['resource', 'crew', 'equipment'],
    '/approval': ['approval', 'audit', 'pending'],
    '/analytics': ['analytics', 'metrics'],
    '/heatmap': ['heatmap', 'traffic pattern'],
    '/assistant': ['assistant', 'chat']
  };
  for (const route of Object.keys(touches)) {
    if (touches[route].some(k => q.includes(k))) return route;
  }
  return null;
}

export { calculatePriorityScore, calculateSuitabilityScore, generateAIRecommendation };