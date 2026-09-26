import React, { useMemo, useState } from 'react';
import { Sparkles, Play, RotateCcw, Search, PlayCircle, Brain, GitBranch, Lightbulb, Puzzle, Target, CheckCircle2, ArrowRight, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Panel, Badge, ProgressBar, ConfirmDialog } from '../components/ui';
import { aiMetricList, aiChangeDescription } from '../services/optimization';
import { calculateSuitabilityScore } from '../services/ai';

const STEPS = [
  'Analyze current plan',
  'Detect train & block conflicts',
  'Score candidate windows',
  'Evaluate resource reallocation',
  'Build optimized draft',
  'Prepare before/after comparison',
];

const AI_WORK_STEPS = [
  { title: 'Collect Tasks', text: 'Maintenance requests received from Engineering, S&T and Traction departments via TMS, SMMS, TDMS integration.' },
  { title: 'Calculate Priority', text: 'Safety criticality, asset importance, urgency, overdue status, and operational impact evaluated using weighted scoring.' },
  { title: 'Check Train Constraints', text: 'Windows conflicting with passenger and goods train operations are flagged and removed from consideration.' },
  { title: 'Find Candidate Windows', text: 'Operationally feasible maintenance windows identified using timetable and corridor availability data.' },
  { title: 'Check Task Compatibility', text: 'Tasks compared by location proximity, duration fit, department requirements, and safety compatibility.' },
  { title: 'Bundle Compatible Tasks', text: 'Compatible tasks grouped into common blocks when this improves utilization and meets all constraints.' },
  { title: 'Check Resources', text: 'Crew availability, equipment status, and skill requirements validated for every proposed block.' },
  { title: 'Select Best Plan', text: 'Constraint optimizer selects plan maximizing priority coverage, utilization, and multi-department coordination.' },
];

const EXPLANATION_FACTORS = [
  { label: 'Safety Criticality', value: 95 },
  { label: 'Asset Criticality', value: 90 },
  { label: 'Urgency', value: 94 },
  { label: 'Operational Impact', value: 88 },
];

const BUNDLE_TASKS = ['T102 · Track · 60 min · Engineering', 'S143 · Signal · 45 min · S&T', 'O221 · OHE · 60 min · Traction'];
const BUNDLE_CHECKS = [
  'Same planning corridor (C1)',
  'Compatible work locations (Stations B–D)',
  'Available block duration (120 min ≥ 165 min combined)',
  'Crew availability confirmed',
  'Equipment availability confirmed',
  'No train movement conflicts',
  'Safety constraints satisfied',
];

export function AIPlanningPage() {
  const { blocks, aiDemo, runAiDemo, resetAiDemo, applyAiPlanToPlanner, showToast, session, addNotification } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const metrics = aiDemo.metrics;

  const run = () => {
    const res = runAiDemo(STEPS);
    if (res.before.conflicts === 0 && res.before.review === 0) {
      showToast('The current plan is already conflict-free — nothing for the optimizer to improve.', 'info');
    } else {
      showToast(`Prototype optimization found ${res.changes.length} change(s)`, 'success');
    }
    addNotification(`AI optimization ran — ${res.after.conflicts} conflicts remaining, ${res.after.avgUtil}% avg utilization`);
  };

  const stats = useMemo(() => {
    if (!aiDemo.plan || !metrics) return null;
    const tasksOptimized = aiDemo.plan.reduce((s, b) => s + (b.tasks ? b.tasks.length : 0), 0);
    return {
      tasks: tasksOptimized,
      blocks: aiDemo.changes ? aiDemo.changes.length : 0,
      util: metrics.after.avgUtil,
    };
  }, [aiDemo, metrics]);

  const beforeList = metrics ? aiMetricList(metrics.before) : [];
  const afterList = metrics ? aiMetricList(metrics.after) : [];

  const explanation = useMemo(() => {
    if (!metrics) return '';
    const parts = [];
    if (metrics.after.conflicts < metrics.before.conflicts) parts.push(`resolves ${metrics.before.conflicts - metrics.after.conflicts} conflict(s) (${metrics.before.conflicts} → ${metrics.after.conflicts})`);
    if (metrics.after.effUtil > metrics.before.effUtil) parts.push(`raises effective utilization from ${metrics.before.effUtil}% to ${metrics.after.effUtil}%`);
    if (metrics.after.highPriUnresolved < metrics.before.highPriUnresolved) parts.push(`unblocks ${metrics.before.highPriUnresolved - metrics.after.highPriUnresolved} high-priority task(s)`);
    if (!parts.length) parts.push('keeps the plan unchanged');
    return `The optimizer moved conflicting blocks to scored candidate windows and reallocated reserve resources, which ${parts.join(', ')}. This is a prototype recommendation — a planner must review and approve it before it becomes the working plan.`;
  }, [metrics]);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">AI Planning — Before vs After</div>
          <div className="page-description">Run the prototype optimizer to compare the current plan against an AI-improved draft (not applied until a planner approves).</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ai" onClick={run}><Play width={15} height={15} /> Run AI Optimization</button>
          <button className="btn btn-secondary" onClick={() => { resetAiDemo(); showToast('Demo reset', 'info'); }}><RotateCcw width={15} height={15} /> Reset</button>
        </div>
      </div>

      {stats && (
        <div className="alert alert-green">
          <span className="alert-icon"><CheckCircle2 width={16} height={16} /></span>
          <div style={{ flex: 1 }}>
            <b>Optimization Complete</b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginTop: 12 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{stats.tasks}</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>Tasks Optimized</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{stats.blocks}</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>Blocks Recommended</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800 }}>{stats.util}%</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>Avg Utilization</div></div>
            </div>
          </div>
        </div>
      )}

      <Panel title="AI Optimization" icon={<Brain width={18} height={18} color="var(--purple)" />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg)' }}>
            <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: .5, color: 'var(--muted)' }}>BEFORE — CURRENT PLAN</div>
            <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
              {beforeList.map(it => <MetricRow key={it.k} label={it.k} value={`${it.v}${it.s}`} />)}
            </div>
          </div>
          <div style={{ border: '2px solid var(--purple)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: .5, color: 'var(--purple)' }}>AFTER — AI OPTIMIZED DRAFT</div>
            <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
              {afterList.length ? afterList.map(it => <MetricRow key={it.k} label={it.k} value={`${it.v}${it.s}`} highlight />) : (
                <div className="note">Run optimization to compute the improved draft.</div>
              )}
            </div>
          </div>
        </div>
        {metrics && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 12, border: '1px solid var(--purple)', background: 'rgba(139,92,246,.08)', borderRadius: 10, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
              <Sparkles width={16} height={16} color="var(--purple)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div><b>AI Explanation:</b> {explanation}</div>
            </div>
          </div>
        )}
      </Panel>

      {metrics && (
        <Panel title="What Changed?" icon={<GitBranch width={18} height={18} color="var(--purple)" />} actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setReviewing(true)}><Search width={13} height={13} /> Review Changes</button>
            <button className="btn btn-ai btn-sm" onClick={() => aiDemo.changes?.length ? setConfirm(true) : showToast('Nothing to apply', 'error')} disabled={aiDemo.applied}><PlayCircle width={13} height={13} /> Apply to Planner</button>
          </>
        }>
          {aiDemo.changes && aiDemo.changes.length > 0 ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {aiDemo.changes.map((c, i) => {
                const sb = c.beforeConf ? c.beforeConf.all.length : 0;
                const sa = c.afterConf ? c.afterConf.all.length : 0;
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)' }}>
                    <span style={{ color: 'var(--purple)', flexShrink: 0, display: 'inline-flex' }}>{c.moved ? <ArrowRight width={15} height={15} /> : <Wrench width={15} height={15} />}</span>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <div dangerouslySetInnerHTML={{ __html: aiChangeDescription(c).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
                      {reviewing && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                          Conflicts <b>{sb} → {sa}</b>
                          {c.moved && <> · AI suitability <b>{calculateSuitabilityScore(c.before, session).score} → {calculateSuitabilityScore(c.after, session).score}</b></>}
                        </div>
                      )}
                    </div>
                    <Badge tone={c.moved ? 'info' : 'medium'}>{c.moved ? 'MOVE' : 'RESOURCE'}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="alert alert-green"><CheckCircle2 width={15} height={15} style={{ color: 'var(--green)' }} /><div>No changes required — the current plan is already conflict-free.</div></div>
          )}
          {aiDemo.status && (
            <div className="alert alert-blue" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: `<span class="alert-icon">i</span><div>${aiDemo.status}</div>` }} />
          )}
        </Panel>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start' }}>
        <Panel title="How the AI Works" icon={<Lightbulb width={18} height={18} color="var(--blue)" />}>
          <div style={{ display: 'grid', gap: 10 }}>
            {AI_WORK_STEPS.map((s, i) => (
              <div key={s.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(139,92,246,.12)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 18 }}>
          <Panel title="AI Priority Explanation — Track Defect T102" icon={<Target width={18} height={18} color="var(--red)" />}>
            {EXPLANATION_FACTORS.map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  <span>{f.label}</span><span>{f.value}</span>
                </div>
                <ProgressBar value={f.value} color={f.value >= 90 ? 'var(--red)' : 'var(--orange)'} />
              </div>
            ))}
            <div className="alert alert-red" style={{ marginTop: 8 }}>
              <span className="alert-icon">!</span>
              <div><b>Final AI Priority: 92/100</b><br />High safety impact and overdue maintenance require immediate scheduling.</div>
            </div>
          </Panel>

          <Panel title="Task Bundling Logic" icon={<Puzzle width={18} height={18} color="var(--purple)" />}>
            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              {BUNDLE_TASKS.map(t => (
                <div key={t} style={{ border: '1px solid var(--purple)', borderRadius: 8, padding: 8, fontSize: 13, background: 'rgba(139,92,246,.06)' }}>{t}</div>
              ))}
            </div>
            <div className="note">
              <b>AI Compatibility Check:</b>
              <div style={{ marginTop: 6 }}>
                {BUNDLE_CHECKS.map(c => (
                  <div key={c} style={{ fontSize: 12, lineHeight: 1.8, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <CheckCircle2 width={13} height={13} style={{ color: 'var(--green)', flexShrink: 0 }} /> {c}
                  </div>
                ))}
              </div>
            </div>
            <div className="alert alert-blue" style={{ marginTop: 12 }}>
              <Puzzle width={16} height={16} style={{ color: 'var(--purple)', flexShrink: 0 }} />
              <div><b>Result:</b> {blocks.find(b => b.type === 'COMBINED' && b.corridor === 'C1')?.id || 'B-042'} combines 3 compatible tasks into one coordinated maintenance block, improving utilization from 50% to 92%.</div>
            </div>
          </Panel>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          open
          title="Apply AI Optimization to Planner?"
          message={`Apply <b>${aiDemo.changes.length} draft change(s)</b> to the planner?<br><br>Every modified block will be marked <b>Requires Review</b> and queued for planner approval in Approval & Audit. No block becomes active until a planner approves it.`}
          confirmLabel="Apply to Planner"
          onConfirm={() => { setConfirm(false); applyAiPlanToPlanner(); }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <b style={highlight ? { color: 'var(--purple)' } : undefined}>{value}</b>
    </div>
  );
}