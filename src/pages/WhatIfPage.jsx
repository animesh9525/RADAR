import React, { useEffect, useMemo, useState } from 'react';
import {
  GitBranch, Play, RotateCcw, RefreshCw, CheckCircle2, AlertTriangle, TrendingUp, Sparkles,
  Shuffle, CalendarDays, Wrench,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { makeAnalyzer } from '../utils/analyzer';
import { Panel, Badge, Modal, ConfirmDialog, EmptyState, ProgressBar } from '../components/ui';
import { createSimulationCopy, runSimulation, simulationStatus, comparePlans, generateImpactSummary, exploreCandidateWindows } from '../services/whatif';
import { validateBlockData } from '../services/vblock';
import { aiBuildOptimizedPlan, aiPlanMetrics, aiChangeDescription } from '../services/optimization';

export function WhatIfPage() {
  const { blocks, trains, taskData, whatIf, setWhatIfState, showToast, applyOptimizedPlanToPlanner } = useApp();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);
  const session = analyzer.session;
  const { original, modified, lastResult, candidates, selectedCandidateIdx } = whatIf;

  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [scenario, setScenario] = useState('');
  const [errors, setErrors] = useState('');
  const [reopt, setReopt] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Coming from block detail "Analyze Impact"
  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.blockId) setSelectedId(e.detail.blockId);
    };
    window.addEventListener('abps:whatif', handler);
    return () => window.removeEventListener('abps:whatif', handler);
  }, []);

  const loadBlock = (id) => {
    const b = blocks.find(x => x.id === id) || blocks[0];
    if (!b) return;
    const orig = createSimulationCopy(b);
    const mod = createSimulationCopy(b);
    setWhatIfState({ original: orig, modified: mod, lastResult: null, candidates: [], selectedCandidateIdx: 0 });
    setForm(formFromBlock(mod));
    setErrors('');
    setReopt(null);
  };

  useEffect(() => {
    if (selectedId) loadBlock(selectedId);
    else if (!original && blocks.length) loadBlock(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, blocks.length]);

  const set = k => e => {
    const v = e.target.value;
    setForm(f => ({ ...f, [k]: v }));
    setWhatIfState({ modified: { ...(modified || {}), [k]: v }, lastResult: null });
  };

  const run = () => {
    if (!original) { showToast('Select a block first', 'error'); return; }
    const b = createSimulationCopy(modified || original);
    b.date = form?.date || b.date;
    b.corridor = form?.corridor || b.corridor;
    b.track = form?.track || b.track;
    b.priority = form?.priority || b.priority;
    b.startTime = form?.startTime || b.startTime;
    b.endTime = form?.endTime || b.endTime;
    b.requiredCrew = parseInt(form?.requiredCrew, 10) || b.requiredCrew;
    b.availableCrew = parseInt(form?.availableCrew, 10) || b.availableCrew;
    b.requiredEquip = (form?.requiredEquip || 'General').trim() || 'General';
    b.equipmentStatus = form?.equipmentStatus || b.equipmentStatus;
    if (form?.tasksRaw) {
      const ids = form.tasksRaw.split(',').map(s => s.trim()).filter(Boolean);
      const existing = {};
      (original.tasks || []).forEach(t => { existing[t.id] = t; });
      b.tasks = ids.map(id => {
        if (existing[id]) return existing[id];
        const full = taskData[id];
        if (full) return { id, name: (full.title || '').split('·')[1]?.trim() || id, department: full.department, duration: full.duration };
        return { id, name: id, department: 'Engineering', duration: '30 min' };
      });
    }
    b.type = b.tasks.length > 1 ? 'COMBINED' : 'SINGLE';
    b.maintenanceType = b.type;

    const val = validateBlockData(b);
    setErrors(val.valid ? '' : val.errors.join(' '));
    if (!val.valid) return;

    const res = runSimulation(original, b, session);
    if (!res.ok) { showToast(res.error, 'error'); return; }
    setWhatIfState({ modified: b, lastResult: res.result, candidates: [] });
    setErrors('');
    setReopt(null);
  };

  const openReopt = () => {
    if (!lastResult) { showToast('Run simulation first', 'error'); return; }
    const ranked = exploreCandidateWindows(lastResult.modified.block, session);
    setWhatIfState({ candidates: ranked });
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div className="page-title">What-If Simulator</div>
        <div className="page-description">Clone a plan, modify it, and compare Original vs Modified impact. The optimizer re-ranks candidate windows for better outcomes.</div>
      </div>

      <Panel title="Simulation Setup" icon={<GitBranch width={18} height={18} color="var(--purple)" />} actions={
        <select className="field-select" style={{ width: 260 }} value={selectedId || ''} onChange={e => setSelectedId(e.target.value)}>
          <option value="" disabled>Select a block to simulate…</option>
          {blocks.map(b => <option key={b.id} value={b.id}>{b.id} — {b.corridor} — {b.date} — {b.startTime}–{b.endTime}</option>)}
        </select>
      }>
        {!original ? (
          <EmptyState icon={Shuffle} title="Select a block" desc="Choose a maintenance block from the dropdown to begin." />
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5 }}>ORIGINAL PLAN</div>
                <div style={{ fontSize: 12, display: 'grid', gap: 4, marginTop: 6 }}>
                  <div><b>Time:</b> {original.startTime}–{original.endTime} ({original.date})</div>
                  <div><b>Corridor:</b> {original.corridor} · <b>Track:</b> {original.track} · <b>Priority:</b> {original.priority}</div>
                  <div><b>Tasks:</b> {(original.tasks || []).map(t => t.id).join(', ')}</div>
                  <div><b>Crew:</b> {original.requiredCrew}/{original.availableCrew} · <b>Equip:</b> {original.requiredEquip} ({original.equipmentStatus})</div>
                  <div><b>AI Priority:</b> {analyzer.pri(original).score} · <b>Suitability:</b> {analyzer.sui(original).score}</div>
                </div>
              </div>
              <form style={{ border: '1px solid var(--blue)', borderRadius: 10, padding: 12, display: 'grid', gap: 8 }} onSubmit={e => { e.preventDefault(); run(); }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', letterSpacing: .5 }}>MODIFIED PLAN</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select className="field-input" style={{ padding: 7 }} value={form?.date || ''} onChange={set('date')}>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}</select>
                  <select className="field-input" style={{ padding: 7 }} value={form?.corridor || ''} onChange={set('corridor')}>{['C1', 'C2', 'C3', 'C4'].map(c => <option key={c}>{c}</option>)}</select>
                  <select className="field-input" style={{ padding: 7 }} value={form?.track || ''} onChange={set('track')}>{['UP', 'DN', 'UP & DN'].map(t => <option key={t}>{t}</option>)}</select>
                  <select className="field-input" style={{ padding: 7 }} value={form?.priority || ''} onChange={set('priority')}>{['MEDIUM', 'HIGH', 'CRITICAL', 'LOW'].map(p => <option key={p}>{p}</option>)}</select>
                  <input className="field-input" style={{ padding: 7 }} type="time" value={form?.startTime || ''} onChange={set('startTime')} />
                  <input className="field-input" style={{ padding: 7 }} type="time" value={form?.endTime || ''} onChange={set('endTime')} />
                  <input className="field-input" style={{ padding: 7 }} type="number" placeholder="Req. crew" value={form?.requiredCrew || ''} onChange={set('requiredCrew')} />
                  <input className="field-input" style={{ padding: 7 }} type="number" placeholder="Avail. crew" value={form?.availableCrew || ''} onChange={set('availableCrew')} />
                  <input className="field-input" style={{ padding: 7 }} placeholder="Equipment" value={form?.requiredEquip || ''} onChange={set('requiredEquip')} />
                  <select className="field-input" style={{ padding: 7 }} value={form?.equipmentStatus || ''} onChange={set('equipmentStatus')}>{['AVAILABLE', 'LIMITED', 'UNAVAILABLE'].map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <input className="field-input" style={{ padding: 7 }} placeholder="Tasks (comma-separated)" value={form?.tasksRaw || ''} onChange={set('tasksRaw')} />
                {errors && <div className="alert alert-red" style={{ padding: 8 }}><span className="alert-icon">!</span><div>{errors}</div></div>}
                <button className="btn btn-primary" style={{ justifyContent: 'center' }} type="submit"><Play width={14} height={14} /> Run Prototype Simulation</button>
              </form>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>SCENARIOS:</span>
              {[
                ['block_unavailable', 'Block Unavailable'],
                ['train_added', 'Train Added'],
                ['crew_unavailable', 'Crew Unavailable'],
                ['duration_increase', 'Duration Increase'],
                ['priority_change', 'Priority Change'],
                ['equipment_failure', 'Equipment Failure'],
              ].map(([v, label]) => (
                <button key={v} className={`btn btn-sm ${scenario === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => applyScenario(v, original, setForm, setWhatIfState, setScenario, showToast, setErrors)}>{label}</button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => resetModified(original, setForm)}><RotateCcw width={13} height={13} /> Reset</button>
            </div>
          </div>
        )}
      </Panel>

      {lastResult && <ResultsPanel result={lastResult} analyzer={analyzer} />}

      {lastResult && (
        <Panel title="Re-optimize" icon={<RefreshCw width={18} height={18} color="var(--teal)" />} actions={<button className="btn btn-primary btn-sm" onClick={openReopt}><GitBranch width={14} height={14} /> Find Optimized Plan</button>}>
          {candidates && candidates.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {candidates.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', border: `1px solid ${i === (selectedCandidateIdx || 0) ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 10, padding: 12, background: i === (selectedCandidateIdx || 0) ? 'rgba(59,130,246,.05)' : 'var(--card)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Option {i + 1} {i === 0 && <Badge tone="low">Recommended</Badge>}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.candidate.date} {r.candidate.startTime}–{r.candidate.endTime} | {r.candidate.corridor} | Suitability {r.sui.score} | {r.train.label} train | {r.conf.all.length} conflicts</div>
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={() => setConfirm(r)}>Select</button>
                </div>
              ))}
            </div>
          ) : candidates !== null && candidates.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No alternative windows found" desc="All candidate windows are blocked by traffic or maintenance constraints." />
          ) : (
            <EmptyState icon={Wrench} title="Run the simulation first" desc="Then generate optimized plan candidates from the modified plan." />
          )}
        </Panel>
      )}

      {confirm && (
        <ConfirmDialog
          open
          title="Apply Optimized Plan?"
          message={`Apply optimized plan <b>${confirm.candidate.startTime}–${confirm.candidate.endTime}</b> on <b>${confirm.candidate.date}</b> to block <b>${confirm.candidate.id}</b>? This will update actual data and require human review.`}
          confirmLabel="Apply Plan"
          onConfirm={() => { applyOptimizedPlanToPlanner(confirm.candidate); setConfirm(null); setWhatIfState({ lastResult: null }); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <BeforeAfterAIPanel blocks={blocks} trains={trains} taskData={taskData} applyOptimizedPlanToPlanner={applyOptimizedPlanToPlanner} showToast={showToast} />
    </div>
  );
}

function BeforeAfterAIPanel({ blocks, trains, taskData, applyOptimizedPlanToPlanner, showToast }) {
  const [demoState, setDemoState] = useState({ running: false, complete: false, before: null, after: null, changes: [] });
  const session = useMemo(() => ({ taskData, trainSchedule: trains, blocks }), [taskData, trains, blocks]);
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);

  const runOptimization = () => {
    setDemoState(prev => ({ ...prev, running: true }));
    showToast('Running AI optimization...', 'info');

    // Simulate async processing
    setTimeout(() => {
      const currentMetrics = aiPlanMetrics(blocks, session);
      const optimized = aiBuildOptimizedPlan(blocks, session);
      const optimizedMetrics = aiPlanMetrics(optimized.working, session);

      if (currentMetrics.conflicts === 0 && currentMetrics.review === 0) {
        setDemoState({ running: false, complete: true, before: currentMetrics, after: currentMetrics, changes: [] });
        showToast('The current plan is already conflict-free — nothing for the optimizer to improve.', 'info');
      } else {
        setDemoState({ running: false, complete: true, before: currentMetrics, after: optimizedMetrics, changes: optimized.changes, plan: optimized.working });
        showToast(`Optimization complete — ${optimized.changes.length} change(s) proposed`, 'success');
      }
    }, 1200);
  };

  const reset = () => {
    setDemoState({ running: false, complete: false, before: null, after: null, changes: [] });
    showToast('Demo reset', 'info');
  };

  const applyPlan = () => {
    if (!demoState.plan) return;
    demoState.plan.forEach(block => applyOptimizedPlanToPlanner(block));
    showToast('AI-optimized plan applied to Block Planner (requires review)', 'success');
    reset();
  };

  const { before, after, changes, complete, running } = demoState;

  const metricList = (m) => [
    { k: 'Conflicts', v: m.conflicts },
    { k: 'Train Schedule Conflicts', v: m.train },
    { k: 'Resource Conflicts', v: m.resource },
    { k: 'High-Priority Tasks Blocked', v: m.highPriUnresolved },
    { k: 'Effective Utilization', v: m.effUtil, s: '%' },
    { k: 'Blocks Needing Review', v: m.review },
  ];

  const explanation = useMemo(() => {
    if (!before || !after) return '';
    const parts = [];
    if (after.conflicts < before.conflicts) parts.push(`resolves <b>${before.conflicts - after.conflicts} conflict(s)</b> (${before.conflicts} → ${after.conflicts})`);
    if (after.effUtil > before.effUtil) parts.push(`raises <b>effective utilization</b> from ${before.effUtil}% to ${after.effUtil}%`);
    if (after.highPriUnresolved < before.highPriUnresolved) parts.push(`unblocks <b>${before.highPriUnresolved - after.highPriUnresolved} high-priority task(s)</b>`);
    if (!parts.length) parts.push('keeps the plan unchanged');
    return `The optimizer moved conflicting blocks to scored candidate windows and reallocated reserve resources, which ${parts.join(', ')}. This is a prototype recommendation — a planner must review and approve it before it becomes the working plan.`;
  }, [before, after]);

  return (
    <Panel title="Before vs After — AI Optimization" icon={<GitBranch width={18} height={18} color="var(--purple)" />}>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
        Compares the <b>current plan</b> with an <b>AI-optimized draft</b> using the same conflict and suitability analysis used across the app. Nothing changes until a planner reviews and approves it.
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={runOptimization} disabled={running}>
          <Sparkles width={14} height={14} /> {running ? 'Running...' : 'Run AI Optimization'}
        </button>
        {complete && <button className="btn btn-secondary" onClick={reset}><RotateCcw width={14} height={14} /> Reset Demo</button>}
      </div>

      {complete && before && after && (
        <div style={{ display: 'grid', gap: 16 }}>
          {changes.length === 0 ? (
            <div className="alert alert-green">
              <CheckCircle2 width={15} height={15} style={{ color: 'var(--green)' }} />
              <div>No changes required — current plan already conflict-free.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 12 }}>CURRENT PLAN (Manual)</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {metricList(before).map(m => (
                      <div key={m.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--muted)' }}>{m.k}</span>
                        <b>{m.v}{m.s || ''}</b>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--muted)' }}>vs</div>
                <div style={{ border: '2px solid var(--purple)', borderRadius: 12, padding: 16, background: 'rgba(124,77,255,.03)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)', letterSpacing: .5, marginBottom: 12 }}>AI-OPTIMIZED (Draft)</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {metricList(after).map(m => (
                      <div key={m.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--muted)' }}>{m.k}</span>
                        <b style={{ color: before[m.k === 'Conflicts' ? 'conflicts' : m.k === 'Effective Utilization' ? 'effUtil' : 'review'] !== m.v ? 'var(--green)' : undefined }}>{m.v}{m.s || ''}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.6 }}>
                  <Sparkles width={15} height={15} style={{ marginTop: 2, flexShrink: 0, color: 'var(--purple)' }} />
                  <div dangerouslySetInnerHTML={{ __html: `<b>AI Explanation:</b> ${explanation}` }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 8 }}>WHAT CHANGED?</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {changes.slice(0, 5).map((ch, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
                      <CheckCircle2 width={14} height={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--green)' }} />
                      <div>{aiChangeDescription(ch)}</div>
                    </div>
                  ))}
                  {changes.length > 5 && <div style={{ fontSize: 12, color: 'var(--muted)', padding: 8 }}>+ {changes.length - 5} more change(s)</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
                <button className="btn btn-primary" onClick={applyPlan}>
                  <CheckCircle2 width={14} height={14} /> Apply to Planner
                </button>
              </div>

              <div style={{ fontSize: 12, color: 'var(--muted)', padding: 12, background: 'var(--bg)', borderRadius: 8, lineHeight: 1.6 }}>
                <b>Synthetic demonstration:</b> all values are computed live from the current plan with the app's real conflict engine — prototype evaluation only.
                <br />
                <b>Human-in-the-loop:</b> an AI change becomes active only after a planner reviews and approves it. Modified blocks are marked "Requires Review" and appear in Approval & Audit.
              </div>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}

function formFromBlock(b) {
  return {
    date: b.date, corridor: b.corridor, track: b.track, priority: b.priority || 'MEDIUM',
    startTime: b.startTime, endTime: b.endTime, requiredCrew: b.requiredCrew, availableCrew: b.availableCrew,
    requiredEquip: b.requiredEquip || 'General', equipmentStatus: b.equipmentStatus || 'AVAILABLE',
    tasksRaw: (b.tasks || []).map(t => t.id).join(', '),
  };
}

function applyScenario(v, original, setForm, setWhatIfState, setScenario, showToast, setErrors) {
  const b = createSimulationCopy(original);
  switch (v) {
    case 'block_unavailable': {
      const e = timeMin(b.startTime), f = timeMin(b.endTime); const ns = 900, ne = ns + (f - e);
      b.startTime = toTime(ns); b.endTime = toTime(ne); b.equipmentStatus = 'UNAVAILABLE'; b.requiredEquip = 'Unavailable equipment';
      break;
    }
    case 'train_added': {
      const e = timeMin(b.startTime), f = timeMin(b.endTime); const ns = 480, ne = ns + (f - e);
      b.startTime = toTime(ns); b.endTime = toTime(ne);
      break;
    }
    case 'crew_unavailable':
      b.availableCrew = Math.max(0, b.requiredCrew - 2);
      break;
    case 'duration_increase': {
      const s = timeMin(b.startTime), e = timeMin(b.endTime); const ne = e + 45;
      b.endTime = toTime(ne);
      break;
    }
    case 'priority_change':
      b.priority = (b.priority === 'CRITICAL') ? 'HIGH' : 'CRITICAL';
      break;
    case 'equipment_failure':
      b.equipmentStatus = 'UNAVAILABLE'; b.requiredEquip = 'OHE Maintenance Unit';
      break;
    default:
      return;
  }
  setScenario(v);
  setForm(formFromBlock(b));
  setWhatIfState({ modified: b, lastResult: null, candidates: [] });
  setErrors('');
  showToast('Scenario applied to Modified Plan (temporary copy only)', 'info');
}

function timeMin(t) { return timeToMinLocal(t); }
function timeToMinLocal(t) { const m = String(t || '').match(/^(\d{1,2}):(\d{2})$/); return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : NaN; }
function toTime(min) { if (isNaN(min)) return '10:00'; const h = Math.floor(min / 60), mn = min % 60; return (h < 10 ? '0' : '') + h + ':' + (mn < 10 ? '0' : '') + mn; }

function resetModified(original, setForm) {
  setForm(formFromBlock(createSimulationCopy(original)));
}

// ============ Results ============
function ResultsPanel({ result, analyzer }) {
  const [showExplain, setShowExplain] = useState(false);
  const m = result.modified, o = result.original;
  const status = simulationStatus(result);
  const comp = comparePlans(o, m);
  const summary = generateImpactSummary(result);
  const explain = analyzer.explain(m.block).text;

  const metric = [
    { label: 'Train Impact', value: m.train.label, sub: `Orig: ${o.train.label}`, color: m.train.color, size: 18 },
    { label: 'Conflict Count', value: m.conf.all.length, sub: conflictDelta(o, m), size: 22 },
    { label: 'Resource Avail', value: m.sui.factors.resourceAvail + '%', sub: `Orig: ${o.sui.factors.resourceAvail}%`, size: 18 },
    { label: 'AI Suitability', value: m.sui.score, sub: suiDelta(o, m), size: 22 },
    { label: 'AI Priority', value: m.pri.score, sub: `Orig: ${o.pri.score}`, size: 22 },
    { label: 'Recommendation', value: m.rec.title, sub: `Orig: ${o.rec.title}`, size: 14 },
  ];

  return (
    <>
      <Panel title="Simulation Results" icon={<CheckCircle2 width={18} height={18} color="var(--green)" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {metric.map((mt, i) => (
            <div key={i} className="app-card" style={{ padding: 14 }}>
              <div className="card-label">{mt.label}</div>
              <div className="card-value" style={{ fontSize: mt.size, color: mt.color }}>{mt.value}</div>
              <div className="note" dangerouslySetInnerHTML={{ __html: mt.sub }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5 }}>RECOMMENDATION</div>
            <div style={{ fontSize: 15, fontWeight: 800, margin: '6px 0' }}>{m.rec.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Prototype Analysis Confidence: {m.strength.strength}%</div>
            <ProgressBar value={m.strength.strength} color="var(--purple)" />
            <div style={{ fontSize: 12, color: 'var(--text2)' }}><b>Reason:</b> {m.rec.reason}</div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => setShowExplain(v => !v)}>Why did AI recommend this?</button>
            {showExplain && <div style={{ marginTop: 10, padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 12, lineHeight: 1.6, color: 'var(--text2)' }}>{explain}</div>}
          </div>
          <div style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>SIMULATION STATUS</div>
            <Badge tone={'low'}><TrendingUp width={13} height={13} /> {status.status}</Badge>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Prototype Simulation</div>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {m.conf.trainConflicts.map((c, i) => <div key={'t' + i} className="alert alert-red"><span className="alert-icon">!</span><div><b>Train Conflict</b> — {c.message} ({c.time})</div></div>)}
            {m.conf.blockConflicts.map((c, i) => <div key={'b' + i} className="alert alert-red"><span className="alert-icon">!</span><div><b>Block Overlap</b> — {c.message} ({c.overlap})</div></div>)}
            {m.conf.resourceConflicts.map((c, i) => <div key={'r' + i} className="alert alert-orange"><span className="alert-icon">!</span><div><b>Resource</b> — {c.message}</div></div>)}
            {m.conf.all.length === 0 && <div className="alert alert-green"><CheckCircle2 width={15} height={15} style={{ color: 'var(--green)' }} /><div>No critical conflicts. Prototype analysis clear.</div></div>}
          </div>
        </div>
      </Panel>

      <Panel title="Original vs Modified" icon={<GitBranch width={18} height={18} color="var(--blue)" />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg)' }}>
            <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: .5, color: 'var(--muted)' }}>ORIGINAL PLAN</div>
            <div style={{ fontSize: 12, display: 'grid', gap: 6, marginTop: 8 }}>
              <div><b>Time:</b> {o.block.startTime}–{o.block.endTime} ({o.block.date})</div>
              <div><b>Corridor:</b> {o.block.corridor} · <b>Track:</b> {o.block.track}</div>
              <div><b>Train Impact:</b> {o.train.label} · <b>Conflicts:</b> {o.conf.all.length}</div>
              <div><b>Resources:</b> {o.sui.factors.resourceAvail}% · <b>Suitability:</b> {o.sui.score}</div>
              <div><b>Priority:</b> {o.pri.score} · <b>Recommendation:</b> {o.rec.title}</div>
            </div>
          </div>
          <div style={{ border: '2px solid var(--blue)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: .5, color: 'var(--blue)' }}>MODIFIED PLAN</div>
            <div style={{ fontSize: 12, display: 'grid', gap: 6, marginTop: 8 }}>
              <div><b>Time:</b> {m.block.startTime}–{m.block.endTime} ({m.block.date})</div>
              <div><b>Corridor:</b> {m.block.corridor} · <b>Track:</b> {m.block.track}</div>
              <div><b>Train Impact:</b> {m.train.label} · <b>Conflicts:</b> {m.conf.all.length}</div>
              <div><b>Resources:</b> {m.sui.factors.resourceAvail}% · <b>Suitability:</b> {m.sui.score}</div>
              <div><b>Priority:</b> {m.pri.score} · <b>Recommendation:</b> {m.rec.title}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8, marginTop: 12, fontSize: 13 }}>
          <div style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)' }}>Conflicts</div><b>{o.conf.all.length} → {m.conf.all.length}</b>
            <div>{deltaLabel(comp.conflicts.orig, comp.conflicts.mod, false)}</div>
          </div>
          <div style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)' }}>Suitability</div><b>{o.sui.score} → {m.sui.score}</b>
            <div>{deltaLabel(comp.suitability.orig, comp.suitability.mod, true)}</div>
          </div>
          <div style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)' }}>Resources</div><b>{o.sui.factors.resourceAvail}% → {m.sui.factors.resourceAvail}%</b>
            <div>{deltaLabel(comp.resource.orig, comp.resource.mod, true)}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text2)' }}>
          <Sparkles width={12} height={12} style={{ verticalAlign: -2 }} /> <b>Impact summary:</b> {summary}
        </div>
      </Panel>
    </>
  );
}

function conflictDelta(o, m) {
  if (m.conf.all.length > o.conf.all.length) return '<span style="color:var(--red);">↑ Worsened</span>';
  if (m.conf.all.length < o.conf.all.length) return '<span style="color:var(--green);">↓ Improved</span>';
  return '<span style="color:var(--muted);">— Same</span>';
}
function suiDelta(o, m) {
  if (m.sui.score > o.sui.score) return '<span style="color:var(--green);">↑ Improved</span>';
  if (m.sui.score < o.sui.score) return '<span style="color:var(--red);">↓ Worsened</span>';
  return '— Same';
}
function deltaLabel(orig, mod, higherIsBetter) {
  if (orig === mod) return <span style={{ color: 'var(--muted)' }}>— Same</span>;
  const improved = higherIsBetter ? mod > orig : mod < orig;
  return <span style={{ color: improved ? 'var(--green)' : 'var(--red)' }}>{improved ? '↑ Improved' : '↓ Worsened'}</span>;
}