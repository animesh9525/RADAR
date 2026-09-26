import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Save, X, Trash2, GitBranch, Clock, CalendarDays,
  AlertTriangle, CheckCircle2, Sparkles, ArrowRight, MousePointerClick,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { makeAnalyzer, tone } from '../utils/analyzer';
import { Badge, Panel, StatusBadge, Modal, ConfirmDialog, EmptyState, ProgressBar } from '../components/ui';
import {
  getBlockStatusBadge, sortBlocks, normalizeBlock, blockStatusTone
} from '../services/blocks';
import { buildWindow, calcDurationText, timeToMinutes } from '../services/time';
import { analyzeBlockConflictsFor } from '../services/conflicts';
import { getPriorityCategory, getSuitabilityCategory } from '../services/ai';
import { exploreCandidateWindows } from '../services/whatif';
import { getApprovalStatus } from '../services/approval';

export function BlockPlannerPage() {
  const { blocks, trains, taskData, approvals, updateBlock, addBlock, deleteBlock, showToast, applyOptimizedPlanToPlanner } = useApp();
  const location = useLocation();
  const analyzer = useMemo(() => makeAnalyzer(blocks, trains, taskData), [blocks, trains, taskData]);

  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detailBlock, setDetailBlock] = useState(null);
  const [candidateResults, setCandidateResults] = useState(null);

  // route state to open a specific block
  useEffect(() => {
    if (location.state && location.state.openBlock) {
      setSelectedId(location.state.openBlock);
      setDetailBlock(location.state.openBlock);
    }
  }, [location.state]);

  const visible = useMemo(() => {
    const list = sortBlocks(blocks);
    return list.filter(b => {
      if (filter !== 'All' && b.status !== filter) return false;
      if (q && !(b.id + ' ' + b.corridor + ' ' + b.track + ' ' + b.date).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [blocks, filter, q]);

  const statusCounts = useMemo(() => {
    const c = { Clear: 0, Warning: 0, Conflict: 0, 'Requires Review': 0 };
    blocks.forEach(b => { if (c[b.status] != null) c[b.status]++; else c['Clear']++; });
    return c;
  }, [blocks]);

  const selected = blocks.find(b => b.id === (detailBlock || selectedId)) || null;

  const handleSaved = (blockId) => {
    setCreating(false);
    setEditing(null);
    setSelectedId(blockId);
    setDetailBlock(blockId);
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">Block Planner</div>
          <div className="page-description">Draft, merge and confirm maintenance blocks. AI evaluates every window for conflicts and suitability.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus width={16} height={16} /> New Draft Block</button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        {Object.keys(statusCounts).map(s => (
          <div className="app-card" key={s} style={{ padding: 14 }}>
            <div className="card-label">{s}</div>
            <div className="card-value" style={{ fontSize: 20 }}>{statusCounts[s]}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search width={14} height={14} style={{ position: 'absolute', left: 8, top: 9, color: 'var(--muted)' }} />
          <input className="field-input" style={{ width: 240, paddingLeft: 28 }} placeholder="Search block id / corridor…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {['All', 'Clear', 'Warning', 'Conflict', 'Requires Review'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
        <Panel title={`Maintenance Blocks (${visible.length})`} icon={<CalendarDays width={18} height={18} color="var(--blue)" />}>
          {visible.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No blocks" desc="Try clearing filters or create a new draft block." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {visible.map(b => {
                const a = analyzer.analyze(b);
                const sui = analyzer.sui(b);
                return (
                  <div
                    key={b.id}
                    onClick={() => { setSelectedId(b.id); setDetailBlock(b.id); }}
                    style={{
                      border: `1px solid ${detailBlock === b.id ? 'var(--blue)' : 'var(--border)'}`,
                      borderLeft: `4px solid ${a.hasCritical ? 'var(--red)' : a.hasConflict ? 'var(--orange)' : 'var(--border)'}`,
                      borderRadius: 10, padding: '10px 12px', cursor: 'pointer', background: detailBlock === b.id ? 'rgba(59,130,246,.05)' : 'var(--card)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <b style={{ fontSize: 14 }}>{b.id}</b>
                        <StatusBadge status={b.status} />
                        {a.hasCritical && <Badge tone="critical"><AlertTriangle width={11} height={11} /> Critical</Badge>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {b.corridor}/{b.track} · {b.date} · {b.startTime}–{b.endTime}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                        {b.tasks.map(t => t.id).join(', ')} · crew {b.requiredCrew}/{b.availableCrew} · {b.requiredEquip || 'General'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8 }}>
                        <span>Priority <b>{b.priority || 'MEDIUM'}</b></span>
                        <span>AI Suitability <b style={{ color: tone(sui.score) }}>{sui.score}</b></span>
                        <span>{a.all.length} conflict(s)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <div style={{ display: 'grid', gap: 18 }}>
          {selected ? (
            <BlockDetailPanel
              key={selected.id}
              block={selected}
              analyzer={analyzer}
              approvals={approvals}
              onEdit={() => setEditing(selected.id)}
              onDelete={() => setConfirmDelete(selected)}
              candidates={candidateResults}
              onExplore={async () => { const r = exploreCandidateWindows(selected, analyzer.session); setCandidateResults(r); if (!r.length) showToast('No alternative windows found', 'info'); }}
              onApplyCandidate={(cand) => { applyOptimizedPlanToPlanner(cand); setCandidateResults(null); }}
              onClose={() => { setDetailBlock(null); setSelectedId(null); setCandidateResults(null); }}
              onAnalyzeImpact={() => handleAnalyzeImpact(selected.id)}
            />
          ) : (
            <Panel title="Block Details" icon={<Sparkles width={18} height={18} color="var(--purple)" />}>
              <EmptyState icon={MousePointerClick} title="Select a block" desc="Choose a maintenance block to view its AI explanation, conflicts, and planning windows." />
            </Panel>
          )}
        </div>
      </div>

      {creating && (
        <BlockFormModal
          title="Create Draft Block"
          taskData={taskData}
          onSave={(data) => {
            const b = normalizeBlock({ ...data, priority: data.priority || 'MEDIUM', type: data.tasks.length > 1 ? 'COMBINED' : 'SINGLE' });
            addBlock(b);
            handleSaved(b.id);
          }}
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <BlockFormModal
          title={`Edit ${editing}`}
          initial={blocks.find(b => b.id === editing)}
          taskData={taskData}
          onSave={(data) => {
            const b = normalizeBlock({ ...blocks.find(x => x.id === editing), ...data, type: data.tasks.length > 1 ? 'COMBINED' : 'SINGLE' });
            const analysis = analyzeBlockConflictsFor(b, blocks.filter(x => x.id !== editing), trains);
            const status = analysis.hasCritical ? 'Conflict' : analysis.hasConflict ? 'Warning' : 'Clear';
            const signed = { ...b, status };
            updateBlock(editing, signed, { requiresReview: signingRequires(status) });
            handleSaved(editing);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          open
          title={`Delete ${confirmDelete.id}?`}
          message={`Remove draft block <b>${confirmDelete.id}</b>? This cannot be undone for the prototype session.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { deleteBlock(confirmDelete.id); setConfirmDelete(null); setDetailBlock(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function signingRequires(status) {
  return status === 'Warning' || status === 'Conflict';
}

function handleAnalyzeImpact(blockId) {
  window.dispatchEvent(new CustomEvent('abps:whatif', { detail: { blockId } }));
}

// ============ Detail panel ============
function BlockDetailPanel({ block, analyzer, approvals, onEdit, onDelete, candidates, onExplore, onApplyCandidate, onClose, onAnalyzeImpact }) {
  const { blocks, trains } = useApp();
  const [showExplain, setShowExplain] = useState(false);
  const sui = analyzer.sui(block);
  const pri = analyzer.pri(block);
  const rec = analyzer.rec(block);
  const explain = analyzer.explain(block);
  const strength = analyzer.strength(block);
  const approval = getApprovalStatus(approvals, block.id);
  const factors = sui.factors;

  return (
    <Panel
      title={`${block.id} — Details`}
      icon={<Sparkles width={18} height={18} color="var(--purple)" />}
      actions={<button className="btn btn-ghost btn-sm" onClick={onClose}><X width={16} height={16} /></button>}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={block.status} />
          <Badge tone={approval.category === 'approved' ? 'low' : approval.category === 'rejected' ? 'critical' : 'info'}>
            {(approval.category || 'pending').toUpperCase()}
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
          <div><b>Corridor:</b> {block.corridor} / {block.track}</div>
          <div><b>Date:</b> {block.date}</div>
          <div><b>Window:</b> {block.startTime}–{block.endTime} ({block.duration})</div>
          <div><b>Type:</b> {block.type || block.maintenanceType}</div>
          <div><b>From:</b> {block.from}</div>
          <div><b>To:</b> {block.to}</div>
          <div><b>Crew:</b> {block.requiredCrew}/{block.availableCrew}</div>
          <div><b>Equip:</b> {block.requiredEquip || 'General'} ({block.equipmentStatus})</div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {block.tasks.map(t => <span key={t.id} className="badge plain">{t.id}</span>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, background: 'var(--bg)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5 }}>AI PRIORITY</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
              <b style={{ fontSize: 22 }}>{pri.score}</b>
              <Badge tone={getPriorityCategory(pri.score).cls}>{getPriorityCategory(pri.score).label}</Badge>
            </div>
            <ProgressBar value={pri.score} color={tone(pri.score)} />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>safety {pri.factors.safety} · asset {pri.factors.asset} · urgency {pri.factors.urgency}</div>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, background: 'var(--bg)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5 }}>AI SUITABILITY</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
              <b style={{ fontSize: 22 }}>{sui.score}</b>
              <Badge tone={getSuitabilityCategory(sui.score).cls}>{getSuitabilityCategory(sui.score).label}</Badge>
            </div>
            <ProgressBar value={sui.score} color={tone(sui.score)} />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>conflict {factors.conflictRisk} · corridor {factors.corridorAvail}</div>
          </div>
        </div>

        {/* Suitability factors */}
        <div style={{ display: 'grid', gap: 6 }}>
          {Object.entries({ Priority: factors.priorityAlignment, 'Corridor Avail': factors.corridorAvail, 'Resource Avail': factors.resourceAvail, Traffic: factors.traffic, 'Conflict Risk': factors.conflictRisk, 'Task Compat': factors.taskCompat }).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 110, color: 'var(--muted)', fontWeight: 600 }}>{k}</span>
              <div style={{ flex: 1 }}><ProgressBar value={v} color={tone(v)} /></div>
              <b style={{ width: 34, textAlign: 'right' }}>{v}%</b>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--card)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5 }}>AI RECOMMENDATION</div>
          <div style={{ fontSize: 15, fontWeight: 800, margin: '6px 0' }}>{rec.title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Prototype Analysis Confidence: {strength}%</div>
          <ProgressBar value={strength} color="var(--purple)" />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}><b>Reason:</b> {rec.reason}</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setShowExplain(v => !v)}>Why did AI recommend this?</button>
          {showExplain && (
            <div style={{ marginTop: 8, padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{explain.text}</div>
          )}
        </div>

        {/* Conflicts */}
        <div style={{ display: 'grid', gap: 6 }}>
          {rec.analysis.trainConflicts.map((c, i) => (
            <div className="alert alert-red" key={'t' + i}><span className="alert-icon">!</span><div><b>Train Conflict</b> — {c.message} ({c.time})</div></div>
          ))}
          {rec.analysis.blockConflicts.map((c, i) => (
            <div className="alert alert-red" key={'b' + i}><span className="alert-icon">!</span><div><b>Block Overlap</b> — {c.message} ({c.overlap})</div></div>
          ))}
          {rec.analysis.resourceConflicts.map((c, i) => (
            <div className="alert alert-orange" key={'r' + i}><span className="alert-icon">!</span><div><b>Resource</b> — {c.message}</div></div>
          ))}
          {rec.analysis.all.length === 0 && (
            <div className="alert alert-green"><CheckCircle2 width={15} height={15} style={{ color: 'var(--green)' }} /><div>No critical conflicts. Prototype analysis clear.</div></div>
          )}
        </div>

        {/* Candidate windows */}
        {candidates !== null && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: .5, marginBottom: 6 }}>BETTER PLANNING WINDOWS (SCORED)</div>
            {candidates.length === 0 ? (
              <div className="alert alert-orange">All candidate windows are blocked by traffic or maintenance constraints.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {candidates.map((c, i) => (
                  <div key={i} style={{ border: `1px solid ${i === 0 ? 'var(--green)' : 'var(--border)'}`, borderRadius: 8, padding: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                      <b>{c.candidate.date} {c.candidate.startTime}–{c.candidate.endTime}</b>
                      <button className="btn btn-primary btn-sm" onClick={() => onApplyCandidate(c)}>Select</button>
                    </div>
                    <div style={{ color: 'var(--muted)' }}>Suitability {c.sui.score} · Train impact {c.train.label} · {c.conf.all.length} conflicts · Score {c.score}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onAnalyzeImpact()}><GitBranch width={14} height={14} /> Analyze Impact (What-If)</button>
          <button className="btn btn-secondary btn-sm" onClick={onExplore}><Clock width={14} height={14} /> Find a better planning window</button>
          <button className="btn btn-secondary btn-sm" onClick={onEdit}><Save width={14} height={14} /> Edit</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 width={14} height={14} /> Delete</button>
        </div>
      </div>
    </Panel>
  );
}

// ============ Create / Edit form modal ============
const TRACKS = ['UP', 'DN', 'UP & DN'];
const DATES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PRIORITIES = ['MEDIUM', 'HIGH', 'CRITICAL', 'LOW'];
const EQUIP_STATUS = ['AVAILABLE', 'LIMITED', 'UNAVAILABLE'];

function BlockFormModal({ title, initial, taskData, onSave, onClose }) {
  const empty = {
    corridor: 'C1', date: 'Monday', track: 'UP', priority: 'MEDIUM',
    startTime: '10:00', endTime: '12:00', type: 'SINGLE',
    requiredCrew: 4, availableCrew: 6, requiredEquip: 'General', equipmentStatus: 'AVAILABLE',
    tasksRaw: '', reason: '',
  };
  const [form, setForm] = useState(() => {
    if (!initial) return empty;
    return {
      corridor: initial.corridor, date: initial.date, track: initial.track, priority: initial.priority || 'MEDIUM',
      startTime: initial.startTime, endTime: initial.endTime, type: initial.type,
      requiredCrew: initial.requiredCrew, availableCrew: initial.availableCrew,
      requiredEquip: initial.requiredEquip || 'General', equipmentStatus: initial.equipmentStatus || 'AVAILABLE',
      tasksRaw: (initial.tasks || []).map(t => t.id).join(', '), reason: initial.reason || '',
    };
  });
  const [errors, setErrors] = useState([]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const ids = form.tasksRaw.split(',').map(s => s.trim()).filter(Boolean);
    const tasks = ids.map(id => {
      const full = taskData[id];
      if (full) return { id, name: (full.title || '').split('·')[1]?.trim() || id, department: full.department, duration: full.duration };
      return { id, name: id, department: 'Engineering', duration: '30 min' };
    });
    const s = timeToMinutes(form.startTime), e = timeToMinutes(form.endTime);
    const errs = [];
    if (isNaN(s)) errs.push('Invalid start time');
    if (isNaN(e)) errs.push('Invalid end time');
    if (!isNaN(s) && !isNaN(e) && e <= s) errs.push('End time must be after start time');
    if (!isNaN(s) && !isNaN(e) && e - s > 300) errs.push('Block duration exceeds 5h limit (300 min)');
    if (parseInt(form.requiredCrew, 10) > parseInt(form.availableCrew, 10)) errs.push('Required crew exceeds available crew');
    setErrors(errs);
    if (errs.length) return;
    const window = !isNaN(s) && !isNaN(e) ? buildWindow(s, e) : `${form.startTime}–${form.endTime}`;
    onSave({ ...form, tasks, window, duration: calcDurationText(s, e), maintenanceType: form.type });
  };

  return (
    <Modal open title={title} onClose={onClose} width={620}>
      <div style={{ display: 'grid', gap: 12 }}>
        {errors.length > 0 && (
          <div className="alert alert-red"><span className="alert-icon">!</span><div>{errors.join(' · ')}</div></div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label className="field-label">Corridor</label>
            <select className="field-select" value={form.corridor} onChange={set('corridor')}>{[ 'C1', 'C2', 'C3', 'C4'].map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="field-label">Date</label>
            <select className="field-select" value={form.date} onChange={set('date')}>{DATES.map(d => <option key={d}>{d}</option>)}</select></div>
          <div><label className="field-label">Track</label>
            <select className="field-select" value={form.track} onChange={set('track')}>{TRACKS.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className="field-label">Priority</label>
            <select className="field-select" value={form.priority} onChange={set('priority')}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
          <div><label className="field-label">Start Time</label>
            <input className="field-input" type="time" value={form.startTime} onChange={set('startTime')} /></div>
          <div><label className="field-label">End Time</label>
            <input className="field-input" type="time" value={form.endTime} onChange={set('endTime')} /></div>
          <div><label className="field-label">Required Crew</label>
            <input className="field-input" type="number" min="0" value={form.requiredCrew} onChange={set('requiredCrew')} /></div>
          <div><label className="field-label">Available Crew</label>
            <input className="field-input" type="number" min="0" value={form.availableCrew} onChange={set('availableCrew')} /></div>
          <div><label className="field-label">Required Equipment</label>
            <input className="field-input" value={form.requiredEquip} onChange={set('requiredEquip')} /></div>
          <div><label className="field-label">Equipment Status</label>
            <select className="field-select" value={form.equipmentStatus} onChange={set('equipmentStatus')}>{EQUIP_STATUS.map(s => <option key={s}>{s}</option>)}</select></div>
        </div>
        <div><label className="field-label">Tasks (comma-separated IDs)</label>
          <input className="field-input" value={form.tasksRaw} onChange={set('tasksRaw')} placeholder="T102, S143, O221" /></div>
        <div><label className="field-label">Reason</label>
          <textarea className="field-textarea" rows={2} value={form.reason} onChange={set('reason')} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}><Save width={15} height={15} /> {initial ? 'Save Changes' : 'Create Block'}</button>
        </div>
      </div>
    </Modal>
  );
}